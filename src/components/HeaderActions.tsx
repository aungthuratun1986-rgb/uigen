"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, FolderOpen, ChevronDown, Moon, Sun } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { signOut } from "@/actions";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderActionsProps {
  user?: {
    id: string;
    email: string;
  } | null;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] border border-[var(--border)]"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

export function HeaderActions({ user, projectId }: HeaderActionsProps) {
  const router = useRouter();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user && projectId) {
      getProjects()
        .then(setProjects)
        .catch(console.error)
        .finally(() => setInitialLoading(false));
    }
  }, [user, projectId]);

  useEffect(() => {
    if (user && projectsOpen) {
      getProjects().then(setProjects).catch(console.error);
    }
  }, [projectsOpen, user]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentProject = projects.find((p) => p.id === projectId);

  const handleSignInClick = () => {
    setAuthMode("signin");
    setAuthDialogOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthMode("signup");
    setAuthDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNewDesign = async () => {
    const project = await createProject({
      name: `Design #${~~(Math.random() * 100000)}`,
      messages: [],
      data: {},
    });
    router.push(`/${project.id}`);
  };

  if (!user) {
    return (
      <>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <Button
            variant="outline"
            className="h-8 bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
            onClick={handleSignInClick}
          >
            Sign In
          </Button>
          <Button
            className="h-8 gradient-bg text-white border-0 hover:opacity-90"
            onClick={handleSignUpClick}
          >
            Sign Up
          </Button>
        </div>
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          defaultMode={authMode}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />

      {!initialLoading && (
        <Popover open={projectsOpen} onOpenChange={setProjectsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 gap-2 bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
              role="combobox"
            >
              <FolderOpen className="h-4 w-4" />
              {currentProject ? currentProject.name : "Select Project"}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0 bg-[var(--popover)] border-[var(--border)]"
            align="end"
          >
            <Command className="bg-transparent">
              <CommandInput
                placeholder="Search projects..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="text-[var(--foreground)]"
              />
              <CommandList>
                <CommandEmpty className="text-[var(--muted)]">No projects found.</CommandEmpty>
                <CommandGroup>
                  {filteredProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => {
                        router.push(`/${project.id}`);
                        setProjectsOpen(false);
                        setSearchQuery("");
                      }}
                      className="text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      <Button
        className="flex items-center gap-2 h-8 gradient-bg text-white border-0 hover:opacity-90"
        onClick={handleNewDesign}
      >
        <Plus className="h-4 w-4" />
        New Design
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
        onClick={handleSignOut}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
