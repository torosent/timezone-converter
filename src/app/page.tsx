import TimeConverter from '@/components/TimeConverter';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Universal Time Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Convert any date/time format to your desired format with ease
          </p>
        </div>
        <TimeConverter />
      </div>
    </div>
  );
}