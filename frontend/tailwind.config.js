module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,html}"], // Adjust paths as needed
    theme: {
      extend: {
        colors: {
          primary: "hsl(var(--primary))",
          "primary-foreground": "hsl(var(--primary-foreground))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          border: "hsl(var(--border))",
        },
      },
    },
    plugins: [],
  };
  