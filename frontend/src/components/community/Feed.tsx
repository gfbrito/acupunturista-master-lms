"use client"

import { useState, useEffect, useRef } from "react"
import { api, API_URL } from "@/lib/api"
import { communityService } from "@/services/community"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, ThumbsUp, Plus, Bookmark, MoreHorizontal, Image as ImageIcon, Smile, Paperclip, Mic, Video, Hash, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/LanguageContext"

interface Comment {
    id: string
    content: string
    user: {
        name: string
        avatar: string | null
    }
    createdAt: string
}

interface Post {
    id: string
    title?: string
    content: string
    imageUrl?: string
    author: {
        name: string
        avatar: string | null
    }
    createdAt: string
    _count: {
        comments: number
    }
    comments?: Comment[]
    poll?: {
        id: string
        question: string
        options: {
            id: string
            text: string
            _count?: {
                votes: number
            }
        }[]
        userVoteId?: string
    }
}

interface FeedProps {
    spaceId?: string
}

export function Feed({ spaceId }: FeedProps) {
    const { t } = useLanguage()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    // Create Post State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newPostTitle, setNewPostTitle] = useState("")
    const [newPostContent, setNewPostContent] = useState("")
    const [postImageUrl, setPostImageUrl] = useState("")
    const [uploadingImage, setUploadingImage] = useState(false)
    const imageInputRef = useRef<HTMLInputElement>(null)

    // Comments State
    // Comments State
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
    const [newCommentContent, setNewCommentContent] = useState("")
    const [spaces, setSpaces] = useState<any[]>([])
    const [selectedSpace, setSelectedSpace] = useState<string>("")

    const fetchPosts = async () => {
        try {
            const data = spaceId
                ? await api.get(`/community/posts?spaceId=${spaceId}`).then(res => res.data)
                : await communityService.getFeed()

            // Transform data to match interface if needed (backend returns 'user' not 'author')
            const mappedPosts = data.map((p: any) => ({
                ...p,
                author: p.user,
                comments: p.comments || []
            }))
            setPosts(mappedPosts)
        } catch (error) {
            console.error("Error fetching posts", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSpaces = async () => {
        try {
            const data = await communityService.getSpaces()
            setSpaces(data)
        } catch (error) {
            console.error("Error fetching spaces", error)
        }
    }

    useEffect(() => {
        fetchPosts()
        fetchSpaces()
    }, [spaceId])

    // Poll State
    const [isPollOpen, setIsPollOpen] = useState(false)
    const [pollQuestion, setPollQuestion] = useState("")
    const [pollOptions, setPollOptions] = useState(["", ""])
    const handleAddOption = () => {
        setPollOptions([...pollOptions, ""])
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions]
        newOptions[index] = value
        setPollOptions(newOptions)
    }

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !pollQuestion.trim() && !postImageUrl) return

        const pollData = isPollOpen && pollQuestion.trim() && pollOptions.every(o => o.trim())
            ? { question: pollQuestion, options: pollOptions.filter(o => o.trim()) }
            : undefined

        try {
            await communityService.createPost({
                title: newPostTitle,
                content: newPostContent,
                imageUrl: postImageUrl || undefined,
                spaceId: selectedSpace || spaceId,
                poll: pollData
            })
            setNewPostTitle("")
            setNewPostContent("")
            setPostImageUrl("")
            setIsCreateDialogOpen(false)
            // Reset poll state
            setIsPollOpen(false)
            setPollQuestion("")
            setPollOptions(["", ""])
            fetchPosts()
        } catch (error) {
            console.error("Error creating post", error)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const token = localStorage.getItem('token')
            const res = await api.post('/uploads/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            setPostImageUrl(res.data.url)
        } catch (error) {
            console.error('Error uploading image', error)
            alert('Erro ao fazer upload da imagem')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            await communityService.votePoll(pollId, optionId)
            fetchPosts()
        } catch (error) {
            console.error("Error voting", error)
        }
    }

    const handleAddComment = async (postId: string) => {
        if (!newCommentContent.trim()) return
        try {
            await communityService.addComment(postId, newCommentContent)
            setNewCommentContent("")
            fetchPosts()
        } catch (error) {
            console.error("Error adding comment", error)
        }
    }

    const toggleComments = (postId: string) => {
        setExpandedPostId(expandedPostId === postId ? null : postId)
    }

    if (loading) return <div>Loading feed...</div>



    // ... (rest of state)

    return (
        <div className="space-y-6">
            {/* Create Post Trigger */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
                        <Avatar>
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-gray-500 text-sm hover:bg-gray-100 transition-colors">
                            {t('Start a post...')}
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                            <Plus size={20} />
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>{t('Create Post')}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                        <Input
                            placeholder={t('Title (optional)')}
                            className="text-lg font-semibold border-none px-0 shadow-none focus-visible:ring-0"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder={t('What do you want to share with the community?')}
                            className="min-h-[150px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />

                        {isPollOpen && (
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                                <Input
                                    placeholder="Ask a question..."
                                    value={pollQuestion}
                                    onChange={(e) => setPollQuestion(e.target.value)}
                                    className="bg-white"
                                />
                                <div className="space-y-2">
                                    {pollOptions.map((option, index) => (
                                        <Input
                                            key={index}
                                            placeholder={`Option ${index + 1}`}
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className="bg-white"
                                        />
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full">
                                    <Plus size={14} className="mr-2" /> Add Option
                                </Button>
                            </div>
                        )}

                        {/* Image Preview */}
                        {postImageUrl && (
                            <div className="relative inline-block">
                                <img src={postImageUrl} alt="Preview" className="max-h-48 rounded-lg" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => setPostImageUrl("")}
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={imageInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={uploadingImage}
                            >
                                {uploadingImage ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full" />
                                ) : (
                                    <ImageIcon size={20} />
                                )}
                            </Button>
                            <Button
                                variant={isPollOpen ? "secondary" : "ghost"}
                                size="icon"
                                className="text-gray-500 hover:text-gray-900"
                                onClick={() => setIsPollOpen(!isPollOpen)}
                            >
                                <Hash size={20} />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                                <SelectTrigger className="h-8 w-[180px] text-xs">
                                    <SelectValue placeholder={spaceId ? t('Posting in space') : t('Choose a space')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {spaces.map(space => (
                                        <SelectItem key={space.id} value={space.id}>
                                            {space.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleCreatePost} disabled={!newPostContent.trim() && !pollQuestion.trim() && !postImageUrl}>
                                {t('Publish')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <article key={post.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={post.author.avatar || undefined} />
                                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-gray-900">{post.author.name}</h3>
                                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Bookmark size={20} className="hover:text-gray-600 cursor-pointer" />
                                <MoreHorizontal size={20} className="hover:text-gray-600 cursor-pointer" />
                            </div>
                        </div>

                        <div className="mb-6">
                            {post.title && <h2 className="text-xl font-bold mb-2">{post.title}</h2>}
                            <div className="prose prose-gray max-w-none mb-4">
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Poll Rendering */}
                            {post.poll && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="font-semibold text-lg mb-4">{post.poll.question}</h3>
                                    <div className="space-y-3">
                                        {post.poll.options.map(option => {
                                            const totalVotes = post.poll!.options.reduce((acc, curr) => acc + (curr._count?.votes || 0), 0);
                                            const voteCount = option._count?.votes || 0;
                                            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                                            const isVoted = post.poll!.userVoteId === option.id;
                                            const hasVoted = !!post.poll!.userVoteId;

                                            return (
                                                <div key={option.id} className="relative">
                                                    {hasVoted ? (
                                                        <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden">
                                                            <div
                                                                className={`absolute top-0 left-0 h-full ${isVoted ? 'bg-blue-100' : 'bg-gray-300'} transition-all duration-500`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                                                <span className={`font-medium ${isVoted ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                    {option.text} {isVoted && "(You)"}
                                                                </span>
                                                                <span className="text-sm text-gray-600">{percentage}%</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleVote(post.poll!.id, option.id)}
                                                            className="w-full text-left px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700"
                                                        >
                                                            {option.text}
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500">
                                        {post.poll.options.reduce((acc, curr) => acc + (curr._count?.votes || 0), 0)} votes
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 border-t border-gray-100 pt-4">
                            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                                <ThumbsUp size={18} /> {t('Like')}
                            </button>
                            <button
                                onClick={() => toggleComments(post.id)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                                <MessageCircle size={18} /> {post.comments?.length || post._count?.comments || 0} {t('Comments')}
                            </button>
                        </div>

                        {/* Comments Section */}
                        {expandedPostId === post.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                <div className="space-y-4">
                                    {post.comments?.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={comment.user.avatar || undefined} />
                                                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="bg-gray-50 rounded-lg p-3 flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-sm">{comment.user.name}</span>
                                                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 items-start">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            placeholder={t('Write a comment...')}
                                            value={newCommentContent}
                                            onChange={(e) => setNewCommentContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddComment(post.id)
                                            }}
                                        />
                                        <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={!newCommentContent.trim()}>
                                            {t('Send')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    )
}
