"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const categories = [
	"Food & Dining",
	"Transportation",
	"Entertainment",
	"Utilities",
	"Shopping",
	"Healthcare",
	"Travel",
	"Education",
	"Personal Care",
	"Other",
];

const formSchema = z.object({
	amount: z.coerce.number().positive("Amount must be positive"),
	category: z.string().min(1, "Please select a category"),
	date: z.date(),
	description: z.string().optional(),
});

export default function ExpensePage() {
	const [expenses, setExpenses] = useState([]);
	const [activeTab, setActiveTab] = useState("add");

	useEffect(() => {
		const storedExpenses = localStorage.getItem("expenses");
		if (storedExpenses) {
			setExpenses(
				JSON.parse(storedExpenses, (key, value) =>
					key === "date" ? new Date(value) : value
				)
			);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("expenses", JSON.stringify(expenses));
	}, [expenses]);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: 0,
			category: "",
			date: new Date(),
			description: "",
		},
	});

	function onSubmit(values) {
		const newExpense = { ...values, id: Date.now().toString() };
		setExpenses([newExpense, ...expenses]);
		form.reset();
		setActiveTab("list");
	}

	const chartData = expenses.reduce((acc, expense) => {
		const date = format(new Date(expense.date), "MM/dd");
		const existingEntry = acc.find((entry) => entry.date === date);
		if (existingEntry) {
			existingEntry.amount += expense.amount;
		} else {
			acc.push({ date, amount: expense.amount });
		}
		return acc;
	}, []);

	const totalExpense = expenses.reduce(
		(sum, expense) => sum + expense.amount,
		0
	);

	return (
		<div className="container mx-auto p-4">
			<Card>
				<CardHeader>
					<CardTitle>Expense Tracker</CardTitle>
					<CardDescription>Manage and visualize your expenses</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="add">Add Expense</TabsTrigger>
							<TabsTrigger value="list">Recent Expenses</TabsTrigger>
							<TabsTrigger value="chart">Spending Chart</TabsTrigger>
						</TabsList>
						<TabsContent value="add">
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="amount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Amount</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														placeholder="0.00"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="category"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Category</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a category" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{categories.map((category) => (
															<SelectItem key={category} value={category}>
																{category}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="date"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Date</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant={"outline"}
																className={cn(
																	"w-[240px] pl-3 text-left font-normal",
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
																date > new Date() ||
																date < new Date("1900-01-01")
															}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description (Optional)</FormLabel>
												<FormControl>
													<Input placeholder="Enter a description" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button type="submit">Add Expense</Button>
								</form>
							</Form>
						</TabsContent>
						<TabsContent value="list">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Description</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{expenses.slice(0, 5).map((expense) => (
										<TableRow key={expense.id}>
											<TableCell>
												{format(new Date(expense.date), "PP")}
											</TableCell>
											<TableCell>{expense.category}</TableCell>
											<TableCell>${expense.amount.toFixed(2)}</TableCell>
											<TableCell>{expense.description || "-"}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TabsContent>
						<TabsContent value="chart">
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={chartData}>
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Line
										type="monotone"
										dataKey="amount"
										stroke="#8884d8"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter>
					<div className="flex justify-between items-center w-full">
						<p className="text-sm text-muted-foreground">Total Expenses</p>
						<p className="text-2xl font-bold">${totalExpense.toFixed(2)}</p>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
