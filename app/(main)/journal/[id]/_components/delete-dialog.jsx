"use client";
import { deleteJournalEntry } from '@/actions/journal';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const DeleteJournalEntry = ({entryId}) => {


  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    loading: isDeleting,
    fn: deleteEntryFn,
    data: deletedEntry
  } = useFetch(deleteJournalEntry);

  useEffect(() => {
    if(deletedEntry && !isDeleting){
      setDeleteDialogOpen(false);
      toast.error(`Journal entry deleted successfully!`)

      router.push(
        `/collection/${
            deletedEntry.collectionId ? deletedEntry.collectionId : "unorganized"
        }`
      );
    }
  }, [deletedEntry, isDeleting])

  const handleDelete = () => {
    deleteEntryFn(entryId);
  }


  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>
          <Trash2 className='h-4 w-4 mr-2' size="sm" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. this will permanently delete your journal entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button 
            className='bg-red-500 hover:bg-red-600'
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteJournalEntry;