
# 🚀 The Chronos Cypher – A Treasure Hunt Game

Welcome to the official repository for **The Chronos Cypher**, a **40-level technical treasure hunt game** designed to challenge participants’ **problem-solving skills, technical knowledge, and teamwork**.

---

## 🛠️ Tech Stack

This project is built using a modern web stack for speed, scalability, and developer experience:

- **Framework:** [Next.js](https://nextjs.org/)  
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)  
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

---

## 📝 Project Notes

For extended planning and baseline documentation, refer to our Notion workspace:

🔗 [Project Baseline Notes](https://www.notion.so/Base-Line-262f4a15404980709305c7fbac09f94a)

---

## ⚡ Getting Started

Follow these steps to set up the project locally:

1. **Fork the Repository**  
   [Main Repository](https://github.com/dariogeorge21/asthra10-techdos.git)

2. **Clone Your Fork**  
   ```bash
   git clone https://github.com/YOUR_USERNAME/asthra10-techdos.git


3. **Navigate to Project Directory**

   ```bash
   cd asthra10-techdos
   ```

4. **Install Dependencies**

   ```bash
   npm install
   ```

5. **Run the Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 📂 Directory Structure

Each level is structured as its own page. Follow this convention when creating levels:

```
app/
└── levels/
    ├── level-1/
    │   ├── page.tsx
    │   └── components/   // Optional: for level-specific components
    │
    ├── level-2/
    │   ├── page.tsx
    │   └── components/
    │
    └── ...
    └── level-40/
        └── page.tsx
```

**Rules:**

* Create levels inside `app/levels/`
* Folder name format: `level-%` (e.g., `level-5`)
* Main UI and logic file: `page.tsx`
* Use a `components` folder inside the level folder for reusable elements

---

## 🤝 Contribution Workflow

1. **Make Your Changes**
   Implement a new level or feature in your local fork.

2. **Verify Your Build**

   ```bash
   npm run build
   ```

3. **Commit Your Changes**
   Follow [Conventional Commits](https://www.conventionalcommits.org/).
   Example:

   ```
   feat: add level 15 with a binary puzzle
   ```

4. **Push to Your Fork**

   ```bash
   git push origin main
   ```

5. **Create a Pull Request**

   * Open a PR from your fork’s `main` branch to the original repo’s `main` branch
   * Provide a **clear description** of your changes
   * The project owner will review and merge

---

## 🤖 AI-Assisted Development Workflow

We encourage contributors to use AI tools for **rapid prototyping** and **consistent design**.

### 🔑 Prompt Key

Always include the following instruction in AI prompts:

```
Maintain the same UI/UX design using the existing components across this page while ensuring design consistency and seamless user interaction. Design the page with the components and maintain an overall bright and vibrant theme of shadcn ui.
```

### ⚙️ Recommended Tools & Process

1. **Prototyping (Augment Code)**

   * Use **Augment Code** in *Agent Mode* for generating initial structures
   * Enhance prompts with **Augment Code Prompt Enhancer**

2. **Refinement (GitHub Copilot)**

   * Use **GitHub Copilot** in *Edit Mode* to refine, debug, and optimize code

---

## 🧑‍💻 Example AI Prompt Workflow

**Prompt for Augment Code:**

```
Maintain the same UI/UX design using the existing components across this page while ensuring design consistency and seamless user interaction. Design the page with the components and maintain an overall bright and vibrant theme of shadcn ui.

Task: Create a level page where the user must solve a CSS Flexbox challenge. The page should have:
- A title "Level 5: The Flexbox Froggy"
- An instruction card explaining the goal
- A container with three colored boxes (red, green, blue)
- A text input field for the user to enter a single flexbox property
- A "Submit" button that validates the answer
```

---

---

Do you want me to also **add shields/badges (build, license, contributors, stars, etc.)** at the top of this README to make it look more professional on GitHub?
```
