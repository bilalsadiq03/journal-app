import { getCollection } from '@/actions/collection';
import { getJournalEntries } from '@/actions/journal';
import React from 'react'
import DeleteCollectionDialog from '../_components/delete-collection';
import JournalFilters from '../_components/juornal-filter';

const CollectionPage = async ({ params }) => {

    const { collectionId } = await params;
    const entries = await getJournalEntries({ collectionId });
    const collection = await getCollection(collectionId);
    console.log(entries)
    console.log(collection)

  return (
    <div className='space-y-6'>
        <div className='flex flex-col justify-between '>
            <div className='flex justify-between'>
                <h1 className='text-4xl font-bold gradient-title'>
                    { collectionId === "unorganized"
                    ? "Unorganized Entries"
                    : collection?.name || "Collection"}
                </h1>
                { collection && (
                    <DeleteCollectionDialog
                        collection={collection}
                        entries={entries.data.entries.length}
                    />
                )}
            </div>
            {
                collection?.description && (
                    <h2 className='font-extralight pl-1'>{collection?.description}</h2>
                )
            }
        </div>

        <JournalFilters entries={entries.data.entries} />

    </div>
  )
}

export default CollectionPage