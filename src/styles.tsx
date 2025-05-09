export function Styles() {
  return (
    <style>
      {`
        #onboarding {
          --radius: 0.5rem;
          color: hsl(var(--foreground));
          background: hsl(var(--background));
        }

        #onboarding .light {
          --primary: var(--grass-9);
          --primary-foreground: var(--grass-1);
          --secondary: var(--sage-12);
          --secondary-foreground: var(--sage-1);
          --accent: var(--sage-3);
          --accent-foreground: 240 3% 35%;
          --destructive: var(--red-9);
          --destructive-foreground: var(--red-12);
          --muted: var(--sage-4);
          --muted-foreground: var(--sage-11);
          --background: var(--sage-3);
          --foreground: var(--sage-12);
          --border: var(--sage-5);
          --ring: var(--sage-6);
          --input: var(--border);
          --card: var(--sage-2);
          --card-foreground: var(--sage-12);
          --popover: var(--sage-2);
          --popover-foreground: var(--sage-12);
        }
      `}
    </style>
  );
}
