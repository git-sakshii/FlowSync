"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { PartyPopper, ArrowRight, Users } from "lucide-react"

interface InviteAcceptedDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    projectName: string
    onGoToProject: () => void
}

export function InviteAcceptedDialog({
    open,
    onOpenChange,
    projectId,
    projectName,
    onGoToProject,
}: InviteAcceptedDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0">
                {/* Gradient celebration header */}
                <div className="bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-8 text-center text-white relative overflow-hidden">
                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }} />
                        <div className="absolute top-12 right-12 w-3 h-3 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "1.8s" }} />
                        <div className="absolute bottom-8 left-16 w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "0.6s", animationDuration: "2.2s" }} />
                        <div className="absolute top-8 right-24 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: "0.9s", animationDuration: "1.6s" }} />
                        <div className="absolute bottom-4 right-8 w-2 h-2 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s", animationDuration: "2.4s" }} />
                        <div className="absolute top-16 left-6 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: "1.2s", animationDuration: "2s" }} />
                    </div>

                    <div className="relative z-10">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-in zoom-in duration-500">
                            <PartyPopper className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                            You're In! 🎉
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 text-center">
                    <div>
                        <p className="text-muted-foreground">
                            You've successfully joined
                        </p>
                        <h3 className="text-xl font-bold mt-1">{projectName}</h3>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                            <Users className="h-3.5 w-3.5" />
                            <span>Full access</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                            <span>📋</span>
                            <span>Tasks & Boards</span>
                        </div>
                    </div>

                    <Button
                        onClick={onGoToProject}
                        className="w-full h-12 btn-3d gap-2 text-base"
                    >
                        Go to Project
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Stay on Dashboard
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
