import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function JsonConverter() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">JSON Converter</h1>
            <Card>
                <CardHeader>
                    <CardTitle>JSON Formatting & Conversion</CardTitle>
                    <CardDescription>Paste your JSON to format or convert it to TypeScript interfaces.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Editor will go here...</p>
                </CardContent>
            </Card>
        </div>
    )
}
