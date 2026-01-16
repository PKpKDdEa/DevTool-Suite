import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Loader2, Key, Info } from "lucide-react"

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export default function CommitGenerator() {
    const [apiKey, setApiKey] = useState("")
    const [diff, setDiff] = useState("")
    const [generatedCommit, setGeneratedCommit] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showGuide, setShowGuide] = useState(false)
    const [model, setModel] = useState("gemini-2.0-flash")
    const [customModel, setCustomModel] = useState("")
    const [availableModels, setAvailableModels] = useState<string[]>([])
    const [showDebug, setShowDebug] = useState(false)

    useEffect(() => {
        const storedKey = localStorage.getItem("google_gemini_api_key")
        if (storedKey) setApiKey(storedKey)
    }, [])

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value
        setApiKey(key)
        localStorage.setItem("google_gemini_api_key", key)
    }

    const listModels = async () => {
        if (!apiKey) {
            setError("Please enter API Key first")
            return
        }
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
            const data = await response.json()
            if (data.error) throw new Error(data.error.message)

            const models = (data.models || [])
                .map((m: any) => m.name.replace('models/', ''))
                .filter((m: string) => m.includes('gemini'))
            setAvailableModels(models)
            setShowDebug(true)
        } catch (err) {
            setError("Failed to list models: " + (err instanceof Error ? err.message : String(err)))
        }
    }

    const handleGenerate = async () => {
        if (!apiKey) {
            setError("Please enter your Google Gemini API Key.")
            return
        }
        if (!diff.trim()) {
            setError("Please paste your git diff.")
            return
        }

        const activeModel = model === 'custom' ? customModel : model
        if (!activeModel) {
            setError("Please select or enter a model.")
            return
        }

        setIsLoading(true)
        setError(null)
        setGeneratedCommit("")

        try {
            const google = createGoogleGenerativeAI({
                apiKey: apiKey,
            });

            const { text } = await generateText({
                model: google(activeModel),
                system: 'You are a senior DevOps engineer. Summarize this code diff into a descriptive commit message. Format it with a concise subject line (imperative mood), followed by a blank line, and then a bulleted list of changes explaining "what" and "why". Do not use conventional commit prefixes like "feat:" or "chore:".\n\nExample format:\nRemove old_file.txt and update new_file.txt\n\n- Deleted old_file.txt as it contained outdated information.\n- Added additional context to new_file.txt for clarity on project updates.\n\nOnly return the commit message, no other text.',
                prompt: diff,
            });

            setGeneratedCommit(text)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Commit Generator</h1>
                <p className="text-muted-foreground mt-1">Generate conventional commit messages from your git diffs using AI.</p>
            </div>

            <div className="grid gap-6 flex-1 min-h-0">
                <Card className="border-muted/50 shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Key className="h-4 w-4 text-primary" />
                            API Configuration
                        </CardTitle>
                        <CardDescription>
                            Your API key is stored locally in your browser.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="api-key">Google Gemini API Key</Label>
                                <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="AIzaSy..."
                                    value={apiKey}
                                    onChange={handleApiKeyChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model-select">Model</Label>
                                <Select
                                    id="model-select"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                >
                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                                    <option value="gemini-flash-latest">Gemini Flash Latest</option>
                                    <option value="gemini-pro-latest">Gemini Pro Latest</option>
                                    <option value="custom">Custom...</option>
                                </Select>
                            </div>
                        </div>

                        {model === 'custom' && (
                            <div className="space-y-2">
                                <Label htmlFor="custom-model">Custom Model ID</Label>
                                <Input
                                    id="custom-model"
                                    placeholder="e.g., gemini-1.5-flash-001"
                                    value={customModel}
                                    onChange={(e) => setCustomModel(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={listModels} className="text-xs">
                                Check Available Models
                            </Button>
                        </div>

                        {showDebug && availableModels.length > 0 && (
                            <div className="p-3 bg-muted/50 rounded-md text-xs font-mono max-h-32 overflow-y-auto">
                                <p className="font-semibold mb-1">Models available to your key:</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    {availableModels.map(m => <li key={m}>{m}</li>)}
                                </ul>
                            </div>
                        )}

                        <Collapsible open={showGuide} onOpenChange={setShowGuide} className="border rounded-md p-4 bg-muted/20">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full flex justify-between items-center p-0 h-auto hover:bg-transparent">
                                    <span className="flex items-center gap-2 font-medium text-sm">
                                        <Info className="h-4 w-4" />
                                        How to get a free API Key
                                    </span>
                                    {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-4 text-sm text-muted-foreground space-y-2 animate-in slide-in-from-top-2">
                                <p>1. Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Google AI Studio</a>.</p>
                                <p>2. Sign in with your Google account.</p>
                                <p>3. Click on <strong>"Create API key"</strong>.</p>
                                <p>4. Select a project (or create a new one) and copy the generated key.</p>
                                <p>5. Paste the key above. It is free for typical personal usage limits.</p>
                            </CollapsibleContent>
                        </Collapsible>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 h-full min-h-[400px]">
                    <Card className="flex flex-col h-full border-muted/50 shadow-sm bg-card/50">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-medium">Git Diff</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <Textarea
                                placeholder="Paste your 'git diff' output here..."
                                className="h-full resize-none border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-sm leading-relaxed bg-transparent"
                                value={diff}
                                onChange={(e) => setDiff(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full border-muted/50 shadow-sm bg-card/50">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-medium">Generated Commit</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-medium">Generating...</span>
                                    </div>
                                </div>
                            ) : (
                                <Textarea
                                    readOnly
                                    className="h-full resize-none border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-sm leading-relaxed bg-transparent text-muted-foreground"
                                    value={generatedCommit}
                                    placeholder="Result will appear here..."
                                />
                            )}
                        </CardContent>
                        <CardFooter className="py-3 border-t bg-muted/10 flex justify-between items-center">
                            {error && <span className="text-destructive text-sm font-medium">{error}</span>}
                            <Button onClick={handleGenerate} disabled={isLoading || !diff || !apiKey} className="ml-auto">
                                Generate
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
