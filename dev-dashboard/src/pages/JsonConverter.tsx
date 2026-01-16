import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Copy, Check } from "lucide-react"
import { jsonToCSharp, jsonToPythonPydantic, type Language } from "@/lib/json-converters"

export default function JsonConverter() {
    const [inputJson, setInputJson] = useState("")
    const [outputCode, setOutputCode] = useState("")
    const [language, setLanguage] = useState<Language>("CSharp")
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!inputJson.trim()) {
            setOutputCode("")
            setError(null)
            return
        }

        const timeoutId = setTimeout(() => {
            let result = ""
            if (language === "CSharp") {
                result = jsonToCSharp(inputJson)
            } else {
                result = jsonToPythonPydantic(inputJson)
            }

            if (result.startsWith("// Error") || result.startsWith("# Error")) {
                setError(result)
                setOutputCode("") // Clear output on error? Or show error in output?
                // Let's show the error message in the output area for visibility, 
                // but also keep the error state if we want to show a red border or something.
                setOutputCode(result)
            } else {
                setError(null)
                setOutputCode(result)
            }
        }, 500) // Debounce

        return () => clearTimeout(timeoutId)
    }, [inputJson, language])

    const handleCopy = () => {
        if (!outputCode) return
        navigator.clipboard.writeText(outputCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">JSON Converter</h1>
                    <p className="text-muted-foreground mt-1">Convert JSON to C# classes or Python Pydantic models.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-[200px]">
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                        >
                            <option value="CSharp">C# Class</option>
                            <option value="Python">Python Pydantic</option>
                        </Select>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopy} disabled={!outputCode}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                <Card className="flex flex-col h-full border-muted/50 shadow-sm bg-card/50">
                    <CardHeader className="py-4 border-b bg-muted/20">
                        <CardTitle className="text-sm font-medium">Input JSON</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative">
                        <Textarea
                            placeholder="Paste your JSON here..."
                            className="h-full resize-none border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-sm leading-relaxed bg-transparent"
                            value={inputJson}
                            onChange={(e) => setInputJson(e.target.value)}
                        />
                        {error && (
                            <div className="absolute bottom-2 left-2 right-2 bg-destructive/10 text-destructive text-xs p-2 rounded border border-destructive/20 animate-in fade-in slide-in-from-bottom-2">
                                Invalid JSON
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full border-muted/50 shadow-sm bg-card/50">
                    <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Output {language === 'CSharp' ? 'C#' : 'Python'}</CardTitle>
                        <span className="text-xs text-muted-foreground">Generated Code</span>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <Textarea
                            readOnly
                            className="h-full resize-none border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-sm leading-relaxed bg-transparent text-muted-foreground"
                            value={outputCode}
                            placeholder="Generated code will appear here..."
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
