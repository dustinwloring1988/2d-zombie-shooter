<img width="1024" height="913" alt="git-cover" src="https://github.com/user-attachments/assets/8a7c397d-1268-446a-8be2-2c8f3ca8de00" />

# 2D Zombie Shooter

A fast-paced 2D zombie shooter game built with Next.js and React. Survive endless waves of zombies while upgrading your weapons and defenses!

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Next\.js](https://img.shields.io/badge/Next\.js-000000?style=for-the-badge&logo=Next\.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

## Features

- Fast-paced 2D zombie shooting action with smooth controls
- Multiple weapon types with upgrade systems
- Progressive difficulty with increasingly challenging zombie waves
- Dynamic health and ammo management systems
- Responsive controls for both desktop and touch devices (WASD/mouse or arrow keys/touch)
- Dark theme aesthetic with smooth animations and visual effects
- Real-time score tracking with high score persistence
- Character movement and aiming mechanics
- Wave-based survival gameplay
- In-game UI with health bars, ammo counters, and score display

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dusti/2d-zombie-shooter.git
```

2. Navigate to the project directory:
```bash
cd 2d-zombie-shooter
```

3. Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the game in action.

## How to Play

- Use **WASD** or arrow keys to move your character
- Mouse to aim and **Left Click** to shoot
- Survive as many zombie waves as possible
- Collect upgrades and power-ups
- Try to achieve the highest score possible

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [React](https://reactjs.org/) - UI library
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Lucide React](https://lucide.dev/) - Icon library
- [Next Themes](https://github.com/pacocoursey/next-themes) - Theme management
- [shadcn/ui](https://ui.shadcn.com/) - Reusable UI components

## UI and Theme

The project utilizes a comprehensive UI system built with:

- **Theme Provider**: A custom theme provider based on `next-themes` that enables seamless switching between light and dark modes across the entire application
- **Component Library**: Pre-built UI components from Radix UI and shadcn/ui for consistent design and accessibility
- **Styling**: Tailwind CSS with custom animations and responsive design to ensure optimal gameplay experience across devices
- **Icons**: Lucide React icons for a cohesive visual language throughout the game interface

## Project Structure

```
2d-zombie-shooter/
├── app/                   # Next.js 13+ app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main game page
├── components/            # React components
│   ├── game/              # Game-specific components
│   ├── ui/                # UI components
│   └── theme-provider.tsx # Theme provider for dark/light mode
├── lib/                   # Utility functions
├── public/                # Static assets
└── styles/                # Additional style files
```

## Development

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Known Issues

- Possible performance issues with large numbers of zombies
- Mobile controls could be improved
- Collision detection accuracy on high-speed objects

## Acknowledgments

- Built with Next.js and React
- Inspired by classic zombie survival games
- Icons from [Lucide React](https://lucide.dev/)

## Screenshots

*Game screenshots coming soon - the 2D zombie shooter features a dark-themed interface with responsive controls and dynamic zombie waves.*

## Contact

For questions or support, please open an issue on this repository.
