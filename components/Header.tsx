import Image from 'next/image';
import Link from 'next/link';
 
interface HeaderProps {
  photo?: string;
  gens?: number;
}

export default function Header({ photo, gens }: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full mt-5 border-b-2 pb-3 sm:px-4 px-2">
      <Link href="/" className="flex space-x-2">

        <Image
            alt="Profile picture"
            src={'icon.png'}
            className="w-10 rounded-full"
            width={32}
            height={28} //
          />
        
        <h1 className="sm:text-2xl text-xl font-bold ml-2 tracking-tight">
           audio chat
        </h1>
      </Link>

      <Link
        href="/buy-credits"
        className="flex space-x-2 hover:text-blue-400 transition"
      >
        <div>Buy Credits</div>
      </Link>
        
      {photo ? (
      <div className="flex space-x-6 items-center">
        <div><b>{gens}</b> credits left</div> 
            
        <Image
          alt="Profile picture"
          src={photo}
          className="w-10 rounded-full"
          width={32}
          height={28}
        />
      </div>
      ) : (
        <div className="flex space-x-6">
          <Link
            href="/"
            className="border-r border-gray-300 pr-4 space-x-2 hover:text-blue-400 transition hidden sm:flex"
          >
            <p className="font-medium text-base">Home</p>
          </Link>
        </div>
      )}
    </header>
  );
}
