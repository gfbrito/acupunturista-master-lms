import React from 'react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PlayCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
    id: string;
    title: string;
    durationSeconds?: number;
    isPublished: boolean;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

interface CourseSidebarProps {
    course: Course;
    currentLessonId: string;
    completedLessonIds: string[];
    inProgressLessonIds?: string[];
    progressPercentage: number;
}

export function CourseSidebar({ course, currentLessonId, completedLessonIds, inProgressLessonIds = [], progressPercentage }: CourseSidebarProps) {
    return (
        <div className="h-full border-l bg-gray-50/50 flex flex-col">
            <div className="p-6 border-b bg-white">
                <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">Seu Progresso</h2>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
                    <span className="text-xs text-gray-500">concluído</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <Accordion type="multiple" defaultValue={course.modules.map(m => m.id)} className="w-full space-y-4">
                    {course.modules.map((module, index) => (
                        <AccordionItem key={module.id} value={module.id} className="border rounded-lg bg-white px-2">
                            <AccordionTrigger className="hover:no-underline py-3 px-2">
                                <div className="text-left">
                                    <span className="text-xs text-gray-500 font-normal block mb-1">Módulo {index + 1}</span>
                                    <span className="font-medium">{module.title}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-2">
                                <div className="space-y-1">
                                    {module.lessons.map((lesson) => {
                                        const isCompleted = completedLessonIds.includes(lesson.id);
                                        const isInProgress = inProgressLessonIds.includes(lesson.id);
                                        const isCurrent = lesson.id === currentLessonId;

                                        return (
                                            <Link
                                                key={lesson.id}
                                                href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-md text-sm transition-colors hover:bg-gray-100",
                                                    isCurrent && "bg-primary/10 text-primary font-medium hover:bg-primary/15",
                                                    !lesson.isPublished && "opacity-50 cursor-not-allowed pointer-events-none"
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                                ) : isInProgress ? (
                                                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-primary/60 flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                    </div>
                                                ) : (
                                                    <PlayCircle className={cn("h-4 w-4 shrink-0", isCurrent ? "text-primary" : "text-gray-400")} />
                                                )}
                                                <span className="line-clamp-1">{lesson.title}</span>
                                                {!lesson.isPublished && <Lock className="h-3 w-3 ml-auto text-gray-400" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
