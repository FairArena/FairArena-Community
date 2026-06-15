<p align="center">
  <img src="https://fra.cloud.appwrite.io/v1/storage/buckets/697b974d001a7a80496e/files/697b9764002453409e98/view?project=69735edc00127d2033d8&mode=admin" alt="FairArena Logo" width="140" height="140">
</p>

---

<p align="center">
  <strong>Modern full-stack platform for fair and transparent skill assessment</strong>
</p>

---

# FairArena Community

<p align="center">
  <strong>A community-driven platform for creating, sharing, and moderating content with AI-powered assistance</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Docs</a>
</p>

---

## 🚀 Overview

FairArena is a modern Reddit-inspired community platform built with Next.js 15, Sanity CMS, and Clerk authentication. It features AI-powered content moderation via OpenRouter, real-time content updates, community management, and a responsive UI built with Tailwind CSS and Radix UI components.

---

## ✨ Features

- **Community Management**: Create and customize communities (subreddits) with dedicated feeds
- **AI Content Moderation**: Automatic detection and censoring of inappropriate content using AI
- **Post Creation**: Rich text posts with image uploads, voting, and commenting
- **User Profiles**: Personalized profiles with post history
- **Real-Time Updates**: Live content updates via Sanity's Live Content API
- **Search**: Search for posts and communities
- **Authentication**: Secure authentication powered by Clerk

---

## 🛠 Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | Next.js 15 (App Router) | React Framework |
| **Backend** | Next.js Server Actions | API Layer |
| **Database** | Sanity CMS | Content Management |
| **Auth** | Clerk | Authentication |
| **AI** | OpenRouter (GPT-4.1-mini) | Content Moderation |
| **Styling** | Tailwind CSS | Styling Framework |
| **UI** | Radix UI | Accessible Components |
| **Icons** | Lucide React | Icon Library |
| **Language** | TypeScript | Programming Language |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **pnpm** (v8+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fairarena/fairarena-community
   cd fairarena-community
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env` file based on the provided example:
   ```bash
   cp .env.example .env
   ```

   Update the created `.env` file with your specific configuration values for Clerk, Sanity, and OpenRouter.

### Running the Application

```bash
pnpm dev
```

The development server will start at `http://localhost:3000` with Turbopack enabled.

### Setting up Sanity CMS

1. Create a Sanity account and project
2. Install the Sanity CLI:
   ```bash
   npm install -g @sanity/cli
   ```
3. Deploy Sanity Studio:
   ```bash
   sanity deploy
   ```

### Setting up Clerk

1. Create a Clerk application
2. Configure authentication providers
3. Set up redirect URLs
4. Add the environment variables to your `.env` file

---

## 📁 Project Structure

```text
.
├── action/                 # Server Actions
├── app/
│   ├── (app)/              # Main application routes
│   │   ├── c/      # Community pages
│   │   ├── create-post/    # Post creation
│   │   ├── popular/        # Popular posts
│   │   ├── hot/            # Hot posts
│   │   ├── search/         # Search
│   │   └── u/              # User profiles
│   └── (admin)/            # Admin/Studio routes
├── components/             # React components
│   ├── comment/            # Comment components
│   ├── header/             # Header & navigation
│   └── post/               # Post components
├── sanity/
│   ├── lib/                # Sanity queries & client
│   └── schemaTypes/        # Sanity schema definitions
└── tools/                  # AI moderation tools
```

---

## 📚 Documentation

- [Sanity CMS Documentation](https://www.sanity.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Proprietary License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**FairArena Team**

- Website: fairarena.app
- GitHub: github.com/fairarena

<p align="center">
  <sub>Built with ❤️ by the FairArena Team</sub>
</p>
