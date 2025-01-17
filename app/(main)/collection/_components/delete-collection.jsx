"use client";
import { deleteCollection } from '@/actions/collection';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const DeleteCollectionDialog = ({ collection, entriesCount = 0}) => {


  const router = useRouter();
  const [openAlert, setOpenAlert] = useState(false);

  const {
    loading: isDeleting,
    fn: deleteCollectionFn,
    data: deletedCollection
  } = useFetch(deleteCollection);

  useEffect(() => {
    if(deletedCollection && !isDeleting){
      setOpenAlert(false);
      toast.error(
        `Collection "${collection.name}" and all its entries deleted`
      )
      router.push("/dashboard")
    }
  }, [deletedCollection, isDeleting])

  const handleDelete = () => {
    deleteCollectionFn(collection.id)
  }


  return (
    <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>
          <Trash2 className='h-4 w-4 mr-2' size="sm" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &quot;{collection.name}&quot;?
          </AlertDialogTitle>
          <div className='space-y-2 text-muted-foreground text-sm'>
            <p>This will permanently delete:</p>
            <ul className='list-disc list-inside'>
              <li>The collection &quot;{collection.name}&quot;</li>
              <li>
                {entriesCount} journal{" "}
                {entriesCount === 1 ? "entry" : "entries"}
              </li>
            </ul>
            <p className='font-semibold text-red-600'>This action cannot be undone.</p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button 
            className='bg-red-500 hover:bg-red-600'
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete Collection"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCollectionDialog