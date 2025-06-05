# Universal Time Converter

A powerful and intuitive time conversion tool built with Next.js, TypeScript, and Tailwind CSS. Convert any date/time format to multiple output formats with support for various time zones and natural language parsing.

## 🚀 Features

- **Multiple Format Support**: Convert between various date/time formats including ISO 8601, Unix timestamps, relative time, and more
- **Natural Language Parsing**: Input dates in natural language like "tomorrow at 3pm" or "next friday"
- **Timezone Support**: Convert times across different time zones with real-time display
- **Multiple Libraries**: Utilizes different date libraries (date-fns, moment, dayjs) for comprehensive format support
- **Real-time Clock**: Live updating current time display
- **Copy to Clipboard**: Easy copying of converted formats
- **Dark/Light Mode**: Modern responsive design with theme support
- **Error Handling**: Clear feedback for invalid inputs

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Date Libraries**:
  - date-fns & date-fns-tz
  - Moment.js & moment-timezone
  - Day.js with timezone plugin
  - chrono-node for natural language parsing
- **Icons**: Lucide React
- **UI Components**: Headless UI

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd timeconverter
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

1. **Input**: Enter any date/time in the input field. Examples:
   - `2024-12-25T10:30:00`
   - `1735123800` (Unix timestamp)
   - `tomorrow at 2pm`
   - `next friday`
   - `December 25, 2024`

2. **Timezone**: Select your desired timezone from the dropdown

3. **Convert**: The tool automatically converts your input to multiple formats:
   - ISO 8601
   - Unix Timestamp
   - Relative Time
   - Custom formats using different libraries

4. **Copy**: Click the copy button next to any result to copy it to clipboard

## 📁 Project Structure

```
timeconverter/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page component
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── components/
│       └── TimeConverter.tsx # Main converter component
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
