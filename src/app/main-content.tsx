"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContent({ user, project }: MainContentProps) {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  return (
    <FileSystemProvider initialData={project?.data}>
      <ChatProvider projectId={project?.id} initialMessages={project?.messages}>
        <div
          className="h-screen w-screen overflow-hidden animate-fadeIn"
          style={{ backgroundColor: "var(--background)" }}
        >
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel — Chat */}
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <div
                className="h-full flex flex-col"
                style={{
                  backgroundColor: "var(--surface)",
                  borderRight: "1px solid var(--border)",
                }}
              >
                {/* Chat Header */}
                <div
                  className="h-14 flex items-center px-5 gap-3 flex-shrink-0"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    borderLeft: "3px solid",
                    borderImageSlice: 1,
                    borderImageSource:
                      "linear-gradient(to bottom, var(--accent-from), var(--accent-to))",
                  }}
                >
                  <span
                    className="text-2xl font-bold animate-pulse-glow"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ◈
                  </span>
                  <div>
                    <h1
                      className="text-base font-bold leading-none"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent-from), var(--accent-to))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      UIGen
                    </h1>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      AI Component Generator
                    </p>
                  </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-hidden">
                  <ChatInterface />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle
              className="w-[1px] transition-colors"
              style={{ backgroundColor: "var(--border)" }}
            />

            {/* Right Panel — Preview / Code */}
            <ResizablePanel defaultSize={65}>
              <div
                className="h-full flex flex-col"
                style={{ backgroundColor: "var(--surface)" }}
              >
                {/* Top Bar */}
                <div
                  className="h-14 px-5 flex items-center justify-between flex-shrink-0"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    backgroundColor: "var(--surface-elevated)",
                  }}
                >
                  <Tabs
                    value={activeView}
                    onValueChange={(v) =>
                      setActiveView(v as "preview" | "code")
                    }
                  >
                    <TabsList
                      className="p-0.5 h-9"
                      style={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <TabsTrigger
                        value="preview"
                        className="px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:text-white"
                        style={
                          {
                            "--tw-text-opacity": "1",
                          } as React.CSSProperties
                        }
                      >
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="code"
                        className="px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:text-white"
                      >
                        Code
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <HeaderActions user={user} projectId={project?.id} />
                </div>

                {/* Content Area */}
                <div
                  className="flex-1 overflow-hidden"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  {activeView === "preview" ? (
                    <div
                      className="h-full"
                      style={{ backgroundColor: "var(--surface)" }}
                    >
                      <PreviewFrame />
                    </div>
                  ) : (
                    <ResizablePanelGroup
                      direction="horizontal"
                      className="h-full"
                    >
                      {/* File Tree */}
                      <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: "var(--surface)",
                            borderRight: "1px solid var(--border)",
                          }}
                        >
                          <FileTree />
                        </div>
                      </ResizablePanel>

                      <ResizableHandle
                        className="w-[1px] transition-colors"
                        style={{ backgroundColor: "var(--border)" }}
                      />

                      {/* Code Editor */}
                      <ResizablePanel defaultSize={70}>
                        <div
                          className="h-full"
                          style={{ backgroundColor: "var(--surface)" }}
                        >
                          <CodeEditor />
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ChatProvider>
    </FileSystemProvider>
  );
}
