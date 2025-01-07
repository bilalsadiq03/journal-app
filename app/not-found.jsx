import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4 text-center'>
        <h1 className='text-6xl font-bold gradient-title mb-4'>404</h1>
        <p className='text-2xl font-semibold mb-4'>Page Not Found</p>
        <p className='text-gray-600 mb-8'>Sorry, the page you are looking for does not exist or has been moved.</p>
        <Link href='/'>
            <Button variant='journal'>
                Return Home
            </Button>
        </Link>
    </div>
  )
}

export default NotFound