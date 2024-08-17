import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import useSWR from 'swr';
import { useDropzone } from 'react-dropzone';
import LoadingDots from '../components/LoadingDots';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Toggle from '../components/Toggle';
import { Rings } from 'react-loader-spinner';
import React from 'react';
import { ChatGpt } from '../components/ChatGpt';
import { UrlBuilder } from '@bytescale/sdk';
import {
  UploadWidgetConfig,
  UploadWidgetOnPreUploadResult,
} from '@bytescale/upload-widget';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import NSFWFilter from 'nsfw-filter';
import axios from 'axios';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: NextPage = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [noCredits, setNoCredits] = useState<boolean>(false);

  const { data, mutate } = useSWR('/api/remaining', fetcher);
  const { data: session, status } = useSession();


  interface TranscriptProps {
    transcript?: string; // Adjust type if `transcript` can be `null` or `undefined`
  }
  const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {

    const renderTextWithNewlines = (text: string): JSX.Element[] => {
      return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
    };
    return transcript ? (
      <div className="mt-6 text-left bg-gray-100 p-4 rounded-lg max-h-[58vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Transcript: </h3>
        <p>{renderTextWithNewlines(transcript)}</p>
      </div>
    ) : null; // or any other default value you want to return  
  };


  const DropzoneComponent: React.FC<{ setFile: (file: File | null) => void; setFileURL: (url: string | null) => void; }> = ({ setFile, setFileURL }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'audio/*': ['.mp3', '.wav', '.ogg'],
      },
      multiple: false,
      onDrop: (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
          const file = acceptedFiles[0];
          setFile(file);
          setFileURL(URL.createObjectURL(file));
          setAudioName(file.name);
        }
      }
    });

    return (
      <div className="p-4">
        {!file ? (
          <div
            {...getRootProps({ className: 'dropzone' })}
            style={{
              ...dropzoneStyle,
              backgroundColor: isDragActive ? '#e0e0e0' : '#f0f0f0', // Darker color when dragging
              borderColor: isDragActive ? '#333' : '#000', // Darker border color when dragging
            }}
          >
            <input {...getInputProps()} />
            <p>Upload audio file here</p>
          </div>
        ) : (
          <div>
            {!loading ? (
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <p className="mb-2 font-medium">{file.name}</p>
                <div className="w-full">
                  <audio controls className="w-80">
                    <source src={fileURL || ''} type={file.type} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
              <div className="flex-1">
              <button
                onClick={() => {
                  setFile(null);
                  setFileURL(null);
                  setTranscript(null);
                  setError(null);
                }}
                className="bg-dark-olive-green rounded-full text-white font-medium px-4 py-2 mt-9 hover:bg-dark-olive-green-dark transition"
              >
                Try Again
              </button>
              </div>
            </div>
            
            ) : (
              <div>
                <p className="mb-2 font-medium">{file.name}</p>
                <audio controls>
                  <source src={fileURL || ''} type={file.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const dropzoneStyle: React.CSSProperties = {
    border: '2px dashed #000000',
    borderRadius: '10px',
    padding: '100px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    marginTop: '1rem',
  };

  async function generateTranscript(file: File) {

    if (data?.remainingGenerations <= 0) {
      setNoCredits(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData instance and append the file
      const formData = new FormData();
      formData.append('file', file);

      // Make the POST request to the server
      const response = await axios.post('/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check for HTTP errors
      if (response.status !== 200) {
        throw new Error(`Failed to process audio: ${response.statusText}`);
      }

      // Extract and set the transcript from the response
      const result = response.data; // Adjust this based on your API response
      setTranscript(result.results.channels[0].alternatives[0].paragraphs.transcript);

      // Optionally, revalidate or refresh any related data
      mutate();
    } catch (error) {
      // Handle errors appropriately
      setError('An unexpected error occurred.');
    } finally {
      // Reset loading state regardless of success or failure
      setLoading(false);
    }
  }
  useEffect(() => {
    if (file) {
      generateTranscript(file);
    }
  }, [file]);

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Audio Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header photo={session?.user?.image || undefined} gens={data?.remainingGenerations ? Number(data.remainingGenerations) : 0} />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mb-0 mb-8">
        {!file  &&
          (<p className=" mb-1" style={{ fontSize: '2.5rem' }}> 
            <strong> Chat with your audio files </strong>
          </p>)
        }
        {status === 'unauthenticated' && !file && (
            <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
            <Head>
              <title>audio chat</title>
            </Head>

            <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-20">
              <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold tracking-normal text-slate-900 sm:text-5xl color-dark-olive-green">
                Chat with your audio files
              </h1>
      
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-700 leading-7">
                Lectures, meetings, interviews — who has time to relisten?
              </p>
              <div className="flex justify-center space-x-4">
                 <button
                    onClick={() => signIn('google')}
                    className="bg-gray-200 text-black font-semibold py-3 px-6 rounded-2xl flex items-center space-x-2 mt-10 shadow-md hover:bg-gray-300">
                       <img
                        src="google.png" // Path to your image file or URL
                        alt="Google Icon" // Alt text for accessibility
                        className="w-6 h-6" // Adjust size as needed
                      />
                    <span>Sign in with Google </span>
                  </button>
              </div>
             
              <div className="flex justify-center items-center mt-12">
             
            </div>
            </main>
     
          </div>
        )
        }

        {status === 'authenticated' && data && !file && (
          <p className="text-slate-500">
            You have{' '}
            <span className="font-semibold">
              {data?.remainingGenerations}{" "}
              {data?.remainingGenerations != 1 ? "credits" : "credit"}
            </span>{' '}
            left.
          </p>
        )}

        {status === 'authenticated' && (
          <div className='mt-1'>
            <DropzoneComponent setFile={setFile} setFileURL={setFileURL} />
          </div>
        )}

        {loading && (

          <div className="max-w-[670px] h-[250px] mt-14">
            <p> Transcribing...</p>
            <Rings
              height="100"
              width="100"
              color="black"
              radius="6"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              ariaLabel="rings-loading"
            />
          </div>
        )}

        {transcript && transcript !== '\n' && (
          <div className="flex justify-between space-x-4">
            <div className="flex-1">
              <Transcript transcript={transcript} />
            </div>
            <div className="flex-1">
              <ChatGpt transcript={transcript} />
            </div>
          </div>
        )}

        {transcript && transcript === '\n' && (
          <div className="flex justify-between space-x-4 mt-5">
            <p>No transcript available 🙃 Try again!</p>
          </div>
        )}

        {noCredits && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8 max-w-[575px]"
            role="alert"
          >
            <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
              <a href="/buy-credits">You ran out credits! Get some more ;)</a>
            </div>
            <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
              <a href="/buy-credits">Buy Credits</a>
            </div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8 max-w-[575px]"
            role="alert"
          >
            <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
              <a href="/buy-credits">Uh oh! There was an error 🙃</a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Home;