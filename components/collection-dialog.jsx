'use client';
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BarLoader } from 'react-spinners';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { collectionSchema } from '@/app/lib/schema';

const CollectionForm = ({ onSuccess, open, setOpen, loading }) => {

    const {register, handleSubmit, formState: {errors}} = useForm({
        resolver: zodResolver(collectionSchema),
        defaultvalues: {
            name: "",
            descripton: "",
        },
    });

    const onSubmit = handleSubmit(async (data) => {
        onSuccess(data);
    })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          {loading && <BarLoader color="orange" width={"100%"} />}

          <form onSubmit={onSubmit} className="space-y-2">

            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Name</label>
              <Input
                disabled={loading}
                {...register("name")}
                placeholder="Enter collection name..."
                className={`${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Collection Name</label>
              <Textarea
                disabled={loading}
                {...register("description")}
                placeholder="Describe your collection..."
                className={`${
                  errors.descripton ? "border-red-500" : ""
                }`}
              />
              {errors.descripton && (
                <p className="text-red-500 text-sm">{errors.descripton.message}</p>
              )}
            </div>

            <div className='flex justify-end gap-4'>
                <Button 
                    type='button' 
                    variant='ghost' 
                    onClick={() => setOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="journal"
                >
                    Create Collection
                </Button>
            </div>

          </form>

        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CollectionForm;