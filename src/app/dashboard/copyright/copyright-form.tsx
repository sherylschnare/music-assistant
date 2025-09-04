'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { run } from '@genkit-ai/next/client'
import { copyrightInformationLookup } from '@/ai/flows/copyright-information-lookup'
import React from "react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  composer: z.string().min(2, {
    message: "Composer must be at least 2 characters.",
  }),
  lyricist: z.string().optional(),
  arranger: z.string().optional(),
})

export function CopyrightForm() {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      composer: "",
      lyricist: "",
      arranger: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setResult(null)
    try {
      const response = await run(copyrightInformationLookup, {
        ...values,
        lyricist: values.lyricist || 'N/A',
        arranger: values.arranger || 'N/A'
      });
      setResult(response.summary)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to look up copyright information. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Song Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Symphony No. 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="composer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Composer</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ludwig van Beethoven" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lyricist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lyricist (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Charles Jennens" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="arranger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arranger (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Look up Information
          </Button>
        </form>
      </Form>

      {loading && (
         <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">Generating Summary...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Alert className="mt-8 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <AlertTitle className="font-headline text-green-900 dark:text-green-100">Copyright Summary</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
            {result}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
