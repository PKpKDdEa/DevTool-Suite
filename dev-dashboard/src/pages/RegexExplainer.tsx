import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Loader2, Key, Info, Sparkles } from "lucide-react"

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export default function RegexExplainer() {
    const [apiKey, setApiKey] = useState("")
    const [pattern, setPattern] = useState("")
    const [flags, setFlags] = useState({ g: false, i: false, m: false })
    const [testString, setTestString] = useState("")
    const [aiExplanation, setAiExplanation] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showGuide, setShowGuide] = useState(false)
    const [showCheatsheet, setShowCheatsheet] = useState(false)
    const [model, setModel] = useState("gemini-2.0-flash")
    const [customModel, setCustomModel] = useState("")

    useEffect(() => {
        const storedKey = localStorage.getItem("google_gemini_api_key")
        if (storedKey) setApiKey(storedKey)
    }, [])

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value
        setApiKey(key)
        localStorage.setItem("google_gemini_api_key", key)
    }

    const toggleFlag = (flag: 'g' | 'i' | 'm') => {
        setFlags(prev => ({ ...prev, [flag]: !prev[flag] }))
    }

    // Compute highlighted test string
    const highlightedTestString = useMemo(() => {
        if (!pattern || !testString) return testString

        try {
            const flagString = Object.entries(flags)
                .filter(([_, enabled]) => enabled)
                .map(([flag]) => flag)
                .join('')

            const regex = new RegExp(pattern, flagString)
            setError(null)

            // If global flag is not set, only match once
            if (!flags.g) {
                const match = testString.match(regex)
                if (!match) return testString

                const matchIndex = testString.indexOf(match[0])
                return (
                    testString.slice(0, matchIndex) +
                    `<mark class="bg-yellow-300 dark:bg-yellow-600">${match[0]}</mark>` +
                    testString.slice(matchIndex + match[0].length)
                )
            }

            // Global flag: replace all matches
            return testString.replace(regex, (match) =>
                `<mark class="bg-yellow-300 dark:bg-yellow-600">${match}</mark>`
            )
        } catch (err) {
            setError("Invalid regex pattern")
            return testString
        }
    }, [pattern, testString, flags])

    const handleExplain = async () => {
        if (!apiKey) {
            setError("Please enter your Google Gemini API Key.")
            return
        }
        if (!pattern.trim()) {
            setError("Please enter a regex pattern.")
            return
        }

        const activeModel = model === 'custom' ? customModel : model
        if (!activeModel) {
            setError("Please select or enter a model.")
            return
        }

        setIsLoading(true)
        setError(null)
        setAiExplanation("")

        try {
            const google = createGoogleGenerativeAI({
                apiKey: apiKey,
            });

            const { text } = await generateText({
                model: google(activeModel),
                system: `You are a Regular Expression expert. Your goal is to translate cryptic regex patterns into clear, human-readable English sentences.

Format:
1. Start with a 1-sentence summary of what the pattern matches.
2. Provide a bulleted list breaking down the key logic (e.g., '\\d+ matches one or more digits').
3. Do not use technical jargon without explaining it.

Only return the explanation, no other text.`,
                prompt: `Explain this regex pattern: ${pattern}`,
            });

            setAiExplanation(text)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Regex Explainer</h1>
                <p className="text-muted-foreground mt-1">Test regex patterns and get AI-powered explanations.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Interactive Playground */}
                <div className="space-y-6">
                    <Card className="border-muted/50 shadow-sm bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Regex Pattern</CardTitle>
                            <CardDescription>
                                Enter your regular expression pattern
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pattern">Pattern</Label>
                                <Input
                                    id="pattern"
                                    placeholder="e.g., ^[a-z0-9]+@"
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                    className={error && error.includes("Invalid") ? "border-destructive" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Flags</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={flags.g ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleFlag('g')}
                                        className="font-mono"
                                    >
                                        g
                                    </Button>
                                    <Button
                                        variant={flags.i ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleFlag('i')}
                                        className="font-mono"
                                    >
                                        i
                                    </Button>
                                    <Button
                                        variant={flags.m ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleFlag('m')}
                                        className="font-mono"
                                    >
                                        m
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    g = global, i = case insensitive, m = multiline
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col border-muted/50 shadow-sm bg-card/50">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-medium">Test String</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 min-h-[300px]">
                            <div
                                className="h-full p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-auto"
                                dangerouslySetInnerHTML={{ __html: highlightedTestString }}
                            />
                        </CardContent>
                        <CardFooter className="py-3 border-t bg-muted/10">
                            <Textarea
                                placeholder="Type or paste text to test your regex..."
                                className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 font-mono text-sm bg-transparent"
                                value={testString}
                                onChange={(e) => setTestString(e.target.value)}
                            />
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column - AI & Help */}
                <div className="space-y-6">
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
                                        placeholder="e.g., gemini-2.5-flash-001"
                                        value={customModel}
                                        onChange={(e) => setCustomModel(e.target.value)}
                                    />
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

                    <Card className="border-muted/50 shadow-sm bg-card/50">
                        <CardHeader className="py-4 border-b bg-muted/20">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                AI Explanation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 min-h-[200px] relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-medium">Analyzing pattern...</span>
                                    </div>
                                </div>
                            ) : aiExplanation ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">{aiExplanation}</pre>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">Click "Explain with AI" to get a detailed breakdown of your regex pattern.</p>
                            )}
                        </CardContent>
                        <CardFooter className="py-3 border-t bg-muted/10 flex justify-between items-center">
                            {error && !error.includes("Invalid") && <span className="text-destructive text-sm font-medium">{error}</span>}
                            <Button onClick={handleExplain} disabled={isLoading || !pattern || !apiKey} className="ml-auto">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Explain with AI
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-muted/50 shadow-sm bg-card/50">
                        <Collapsible open={showCheatsheet} onOpenChange={setShowCheatsheet}>
                            <CardHeader className="cursor-pointer" onClick={() => setShowCheatsheet(!showCheatsheet)}>
                                <CollapsibleTrigger asChild>
                                    <div className="flex justify-between items-center w-full">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Info className="h-4 w-4 text-primary" />
                                            Quick Cheatsheet
                                        </CardTitle>
                                        {showCheatsheet ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </CollapsibleTrigger>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <h4 className="font-semibold mb-1">Character Classes</h4>
                                        <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                                            <li><code className="bg-muted px-1 rounded">\d</code> - Digit (0-9)</li>
                                            <li><code className="bg-muted px-1 rounded">\w</code> - Word character (a-z, A-Z, 0-9, _)</li>
                                            <li><code className="bg-muted px-1 rounded">\s</code> - Whitespace</li>
                                            <li><code className="bg-muted px-1 rounded">.</code> - Any character</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Quantifiers</h4>
                                        <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                                            <li><code className="bg-muted px-1 rounded">+</code> - One or more</li>
                                            <li><code className="bg-muted px-1 rounded">*</code> - Zero or more</li>
                                            <li><code className="bg-muted px-1 rounded">?</code> - Zero or one</li>
                                            <li><code className="bg-muted px-1 rounded">{`{n,m}`}</code> - Between n and m</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Anchors</h4>
                                        <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                                            <li><code className="bg-muted px-1 rounded">^</code> - Start of string</li>
                                            <li><code className="bg-muted px-1 rounded">$</code> - End of string</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                </div>
            </div>
        </div>
    )
}
