import TimeConverter from '@/components/TimeConverter';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen" /* Removed Tailwind background and text color classes to allow CSS variables to control theme */>
      <ThemeToggle />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" /* Removed text color classes */>
            Universal Time Converter
          </h1>
          <p className="text-lg">
            Convert any date/time format to your desired format with ease
          </p>
        </div>
        <TimeConverter />
      </div>
    </div>
  );
}