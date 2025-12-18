'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { createProduct, updateProduct } from '@/actions/inventory'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Wrench, Info, IndianRupee, BarChart3, Save, Calendar as CalendarIcon, Upload, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

interface ProductFormProps {
    initialData?: any
    productId?: string
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [showWholesale, setShowWholesale] = React.useState(false)
    const [itemType, setItemType] = React.useState<'product' | 'service'>(initialData?.type || 'product')

    const defaultValues: ProductFormValues = {
        name: initialData?.name || '',
        description: initialData?.description || '',
        sku: initialData?.sku || '',
        hsn_code: initialData?.hsn_code || '',
        price: initialData?.price || 0,
        cost_price: initialData?.cost_price || 0,
        stock_quantity: initialData?.stock_quantity || 0,
        gst_rate: initialData?.gst_rate || 0,
        unit: initialData?.unit || 'pcs',
        low_stock_threshold: initialData?.low_stock_threshold || 5,
        type: initialData?.type || 'product',
        image_url: initialData?.image_url || '',
        barcode: initialData?.barcode || '',
        category: initialData?.category || '',
        tax_type: initialData?.tax_type || 'exclusive',
        purchase_tax_type: initialData?.purchase_tax_type || 'exclusive',
        discount: initialData?.discount || 0,
        discount_type: initialData?.discount_type || 'percentage',
        wholesale_price: initialData?.wholesale_price || undefined,
        opening_stock_date: initialData?.opening_stock_date ? new Date(initialData.opening_stock_date) : undefined,
    }

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues,
    })

    async function handleSave(data: ProductFormValues, shouldRedirect: boolean = true) {
        try {
            setLoading(true)
            const submissionData = { ...data, type: itemType }

            if (productId) {
                await updateProduct(productId, submissionData)
                toast.success('Item updated successfully')
            } else {
                await createProduct(submissionData)
                toast.success('Item created successfully')
            }

            router.refresh()

            if (shouldRedirect) {
                router.push('/dashboard/inventory')
            } else {
                // Reset form for new entry but keep current type
                form.reset({
                    ...defaultValues,
                    type: itemType,
                    // keep other useful defaults if needed?
                })
                // Ensure type state stays in sync
                handleTypeChange(itemType)
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = (data: ProductFormValues) => handleSave(data, true)
    const onSaveAndNew = (data: ProductFormValues) => handleSave(data, false)

    const handleTypeChange = (type: 'product' | 'service') => {
        setItemType(type)
        form.setValue('type', type)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Top Bar: Header & Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-lg border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">
                            {productId ? 'Edit Item' : 'Add Item'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {itemType === 'product' ? 'Manage stock and pricing for your products' : 'Setup service details and pricing'}
                        </p>
                    </div>

                    <div className="flex items-center bg-muted/50 p-1.5 rounded-full border">
                        <Button
                            type="button"
                            variant={itemType === 'product' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleTypeChange('product')}
                            className={cn("rounded-full px-6 transition-all font-medium", itemType === 'product' && "shadow-sm")}
                        >
                            Product
                        </Button>
                        <Button
                            type="button"
                            variant={itemType === 'service' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleTypeChange('service')}
                            className={cn("rounded-full px-6 transition-all font-medium", itemType === 'service' && "shadow-sm")}
                        >
                            Service
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-start h-auto p-2 bg-card border rounded-lg gap-2 overflow-x-auto">
                            <TabsTrigger value="general" className="px-4 py-2">General</TabsTrigger>
                            <TabsTrigger value="pricing" className="px-4 py-2">Pricing</TabsTrigger>
                            {itemType === 'product' && (
                                <TabsTrigger value="stock" className="px-4 py-2">Stock</TabsTrigger>
                            )}
                        </TabsList>

                        {/* General Tab */}
                        <TabsContent value="general" className="mt-4 space-y-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="md:col-span-3 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{itemType === 'product' ? 'Item Name' : 'Service Name'} <span className="text-destructive">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={itemType === 'product' ? "Product Name" : "Service Name"} {...field} className="h-10" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="hsn_code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{itemType === 'product' ? 'Item HSN' : 'Service HSN'}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Search HSN/SAC..." {...field} className="h-10" />
                                                            </FormControl>

                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="unit"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Unit</FormLabel>
                                                            <div className="flex gap-2">
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Unit" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                                                        <SelectItem value="box">Box (box)</SelectItem>
                                                                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                                                        <SelectItem value="ltr">Liter (ltr)</SelectItem>
                                                                        <SelectItem value="nos">Numbers (nos)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button type="button" variant="outline" size="icon" title="Add Unit">
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="category"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{itemType === 'product' ? 'Category' : 'Service Category'}</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select Category" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="general">General</SelectItem>
                                                                    <SelectItem value="electronics">Electronics</SelectItem>
                                                                    <SelectItem value="grocery">Grocery</SelectItem>
                                                                    <SelectItem value="services">Services</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="sku"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{itemType === 'product' ? 'Item Code' : 'Service Code'}</FormLabel>
                                                            <div className="flex gap-2">
                                                                <FormControl>
                                                                    <Input {...field} placeholder="" className="h-10" />
                                                                </FormControl>
                                                                <Button type="button" variant="secondary" size="sm" className="whitespace-nowrap">
                                                                    Assign Code
                                                                </Button>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                                {/* Only for product? Or visible for both? Keeping visible as per user implies 'Code' change */}
                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Short description" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-1">
                                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-medium">Add Image</span>
                                                <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pricing Tab */}
                        <TabsContent value="pricing" className="mt-4 space-y-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Sale Price</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sale Price <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                                            <Input type="number" className="pl-8" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tax_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tax Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="exclusive">Without Tax (Exclusive)</SelectItem>
                                                            <SelectItem value="inclusive">With Tax (Inclusive)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="discount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Discount</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="discount_type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>&nbsp;</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="percentage">%</SelectItem>
                                                                <SelectItem value="flat">Flat</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div
                                            className="flex items-center gap-2 cursor-pointer text-primary hover:underline text-sm font-medium w-fit"
                                            onClick={() => setShowWholesale(!showWholesale)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            {showWholesale ? 'Hide Wholesale Price' : 'Add Wholesale Price'}
                                        </div>
                                        {showWholesale && (
                                            <div className="mt-4 p-4 bg-muted/30 rounded-lg animate-in fade-in-50 slide-in-from-top-1">
                                                <FormField
                                                    control={form.control}
                                                    name="wholesale_price"
                                                    render={({ field }) => (
                                                        <FormItem className="max-w-xs">
                                                            <FormLabel>Wholesale Price</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="cost_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Purchase Price</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                                            <Input type="number" className="pl-8" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="purchase_tax_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Purchase Tax Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="exclusive">Without Tax</SelectItem>
                                                            <SelectItem value="inclusive">With Tax</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gst_rate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tax Rate (GST)</FormLabel>
                                                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select GST" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="0">GST @ 0%</SelectItem>
                                                            <SelectItem value="5">GST @ 5%</SelectItem>
                                                            <SelectItem value="12">GST @ 12%</SelectItem>
                                                            <SelectItem value="18">GST @ 18%</SelectItem>
                                                            <SelectItem value="28">GST @ 28%</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Stock Tab - Only for Product */}
                        {itemType === 'product' && (
                            <TabsContent value="stock" className="mt-4 space-y-4">
                                <Card>
                                    <CardContent className="p-6 grid gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="stock_quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Opening Stock</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="opening_stock_date"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="mb-1">As of Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? (
                                                                            format(field.value, "PPP")
                                                                        ) : (
                                                                            <span>Pick a date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={(date) =>
                                                                        date > new Date() || date < new Date("1900-01-01")
                                                                    }
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="low_stock_threshold"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Low Stock Alert</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                                        </FormControl>
                                                        <FormDescription>Warn when qty falls below</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>

                    <div className="flex items-center justify-end gap-3 mt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="button" variant="outline" onClick={form.handleSubmit(onSaveAndNew)} disabled={loading}>
                            Save & New
                        </Button>
                        <Button type="submit" disabled={loading} className="min-w-[120px]">
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
