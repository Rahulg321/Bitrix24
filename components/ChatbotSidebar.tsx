"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, MessageSquare, ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuAction,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useCurrentUser from "@/hooks/use-current-user"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  messages: any[];
};

type ChatbotSidebarProps = {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ChatbotSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation
}: ChatbotSidebarProps) {
  const user = useCurrentUser();
  return (
    <Sidebar className="border-r h-full min-w-[340px]">
      <SidebarHeader className="border-b p-5 bg-background border-b-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Conversations</h2>
        </div>
        <div className="space-y-2">
          <div className="relative w-full">
            <Button
              onClick={onNewChat}
              className="w-full justify-start h-10 rounded-md bg-background text-foreground hover:bg-accent/50 pl-10 border-0"
              variant="ghost"
            >
              <span className="text-base font-medium">New Chat</span>
            </Button>
            <Plus className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
          <div className="relative w-full">
            <Input
              placeholder="Search chats"
              className="h-10 rounded-md bg-background border-0 pl-10 pr-3 text-base font-medium text-foreground placeholder:text-foreground focus-visible:ring-0 focus-visible:outline-none hover:bg-accent/50 shadow-none"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Recent Chats</span>
                  <ChevronDown className="ml-auto h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground px-4">
                      <MessageSquare className="h-14 w-14 mx-auto mb-4 opacity-50" />
                      <p className="text-base">No conversations yet</p>
                      <p className="text-sm">Start a new chat to begin</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <SidebarMenuItem key={conv.id}>
                        <div className="flex items-center justify-between w-full group">
                          <SidebarMenuButton 
                            asChild 
                            isActive={activeId === conv.id}
                            className="flex-1"
                          >
                            <button
                              onClick={() => onSelectConversation(conv.id)}
                              className="text-left w-full"
                            >
                              <div className="truncate text-base">
                                {conv.title || "Untitled"}
                              </div>
                            </button>
                          </SidebarMenuButton>
                          <button
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 p-1 ml-2"
                            onClick={() => onDeleteConversation(conv.id)}
                            aria-label="Delete conversation"
                          >
                            <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-background">
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <div className="relative">
                <SidebarMenuButton asChild className="h-12 pr-10">
                  <button onClick={() => window.location.href = `/profile/${user?.id}`} className="flex items-center gap-3 w-full text-left">
                    <Avatar className="h-8 w-8">
                      {user?.image ? (
                        <AvatarImage src={user.image as string} alt={user?.name || user?.email || "User"} />
                      ) : null}
                      <AvatarFallback>{(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{user?.name || "Signed in user"}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email || ""}</span>
                    </div>
                  </button>
                </SidebarMenuButton>
                <SidebarMenuAction className="right-2 top-2.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="end" className="w-36">
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/login" })} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuAction>
              </div>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-12">
                <a href="http://localhost:3000/auth/login" className="flex items-center gap-3 w-full">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">Sign in</span>
                    <span className="truncate text-xs text-muted-foreground">Access your account</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
