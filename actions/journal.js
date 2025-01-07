'use server';

import { getMoodById, MOODS } from "@/app/lib/moods";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getPixabayImage } from "./public";
import { revalidatePath } from "next/cache";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";

export async function createJournalEntry(data){
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("unauthorized")

        // ArcJet Rate Limiting
        const req = await request();

        const descision = await aj.protect(req, {
            userId,
            requested: 1,
        });

        if (descision.isDenied()){
            if (descision.reason.isRateLimit()){
                const { remaining, reset } = descision.reason;
                console.error(`Rate limit exceeded. Remaining: ${remaining}, Reset: ${reset}`);
                throw new Error("Too many requests. Please try again later.");
            }
            throw new Error("Request Blocked.");
        }


        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            },
        })

        if (!user) throw new Error("User not found")

        const mood = MOODS[data.mood.toUpperCase()];
        if (!mood) throw new Error("Invalid mood");

        const moodImageUrl = await getPixabayImage(data.moodQuery);

        const entry = await db.entry.create({
            data: {
                title: data.title,
                content: data.content,
                mood: mood.id,
                moodScore: mood.score,
                moodImageUrl,
                userId: user.id,
                collectionId: data.collectionId || null,
            }    
        });

        await db.draft.deleteMany({
            where: {
                userId: user.id
            }
        })

        revalidatePath('/dashboard');

        return entry;


    } catch (error) { 
        throw new Error(error.message)
    }
}

export async function getJournalEntries({
  collectionId,
  // ---- Filters can be implemented with backend as well ----
  // mood = null,
  // searchQuery = "",
  // startDate = null,
  // endDate = null,
  // page = 1,
  // limit = 10,
  orderBy = "desc", // or "asc"
} = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Build where clause based on filters
    const where = {
      userId: user.id,
      // If collectionId is explicitly null, get unorganized entries
      // If it's undefined, get all entries
      ...(collectionId === "unorganized"
        ? { collectionId: null }
        : collectionId
        ? { collectionId }
        : {}),

      // ---- Filters can be implemented with backend as well ----
      // ...(mood && { mood }),
      // ...(searchQuery && {
      //   OR: [
      //     { title: { contains: searchQuery, mode: "insensitive" } },
      //     { content: { contains: searchQuery, mode: "insensitive" } },
      //   ],
      // }),
      // ...((startDate || endDate) && {
      //   createdAt: {
      //     ...(startDate && { gte: new Date(startDate) }),
      //     ...(endDate && { lte: new Date(endDate) }),
      //   },
      // }),
    };

    // ---- Get total count for pagination ----
    // const totalEntries = await db.entry.count({ where });
    // const totalPages = Math.ceil(totalEntries / limit);

    // Get entries with pagination
    const entries = await db.entry.findMany({
      where,
      include: {
        collection: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
      // skip: (page - 1) * limit,
      // take: limit,
    });

    // Add mood data to each entry
    const entriesWithMoodData = entries.map((entry) => ({
      ...entry,
      moodData: getMoodById(entry.mood),
    }));

    return {
      success: true,
      data: {
        entries: entriesWithMoodData,
        // pagination: {
        //   total: totalEntries,
        //   pages: totalPages,
        //   current: page,
        //   hasMore: page < totalPages,
        // },
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getJournalEntry(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const entry = await db.entry.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!entry) throw new Error("Entry not found");
    return entry;
    
  } catch (error) {
    throw new Error(error.message);
    
  }
}

export async function deleteJournalEntry(id) {
  try {
      const { userId } = await auth();
      if (!userId) throw new Error("User is not authenticated");

      const user = await db.user.findUnique({
          where: {
              clerkUserId: userId
          },
      })
      if (!user) throw new Error("User not found");

      const entry = await db.entry.findFirst({
          where: {
              userId: user.id,
              id,
          },
      });

      if (!entry) throw new Error("Entry not Found!");
      
      await db.entry.delete({
          where: {
              id,
          },
      });

      revalidatePath('/dashboard');

      return entry;

  } catch (error) {
      throw new Error(error.message);
      
  }
}

export async function updateJournalEntry(data) {
  try {
      const { userId } = await auth();
      if (!userId) throw new Error("User is not authenticated");

      const user = await db.user.findUnique({
          where: {
              clerkUserId: userId
          },
      })
      if (!user) throw new Error("User not found");

      const existingEntry = await db.entry.findFirst({
          where: {
              userId: user.id,
              id: data.id,
          },
      });

      if (!existingEntry) throw new Error("Entry not Found!");
      
      const mood = MOODS[data.mood.toUpperCase()];
        if (!mood) throw new Error("Invalid mood");

        let moodImageUrl = existingEntry.moodImageUrl;

        if (existingEntry.mood !== mood.id){
           moodImageUrl = await getPixabayImage(data.moodQuery);
        }


        const updatedEntry = await db.entry.update({
          where: {
            id: data.id
          },
            data: {
                title: data.title,
                content: data.content,
                mood: mood.id,
                moodScore: mood.score,
                moodImageUrl,
                collectionId: data.collectionId || null,
            }    
        });

      revalidatePath('/dashboard');
      revalidatePath(`/journal/${data.id}`);
      
      return updatedEntry;

  } catch (error) {
      throw new Error(error.message);
      
  }
}

export async function getDraft() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const draft = await db.draft.findUnique({
      where: { userId: user.id },
    });

    return { success: true, data: draft };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveDraft(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const draft = await db.draft.upsert({
      where: { userId: user.id },
      create: {
        title: data.title,
        content: data.content,
        mood: data.mood,
        userId: user.id,
      },
      update: {
        title: data.title,
        content: data.content,
        mood: data.mood,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: draft };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}