import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface IncomeDetailsFormProps {
  initialData?: Partial<z.infer<typeof formSchema>>;
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
}

const formSchema = z.object({
  employmentType: z
    .string()
    .min(1, { message: "Please select your employment type" }),
  employerName: z
    .string()
    .min(2, { message: "Please enter your employer name" }),
  monthlyIncome: z
    .string()
    .min(1, { message: "Please enter your monthly income" }),
  yearsEmployed: z.string().min(1, { message: "Please enter years employed" }),
  existingLoans: z.string(),
  loanAmount: z
    .string()
    .min(1, { message: "Please enter desired loan amount" }),
  loanPurpose: z.string().min(1, { message: "Please select loan purpose" }),
});

const IncomeDetailsForm = ({
  initialData = {},
  onSubmit,
}: IncomeDetailsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employmentType: initialData.employmentType || "",
      employerName: initialData.employerName || "",
      monthlyIncome: initialData.monthlyIncome || "",
      yearsEmployed: initialData.yearsEmployed || "",
      existingLoans: initialData.existingLoans || "No",
      loanAmount: initialData.loanAmount || "",
      loanPurpose: initialData.loanPurpose || "",
    },
  });

  const onSubmitHandler = async (data: z.infer<typeof formSchema>) => {
    try {
      const email = localStorage.getItem("email"); // Retrieve logged-in user's email
      if (!email) {
        toast.error("User email is missing. Please log in again.");
        return;
      }

      const payload = {
        email, // Include the logged-in email
        ...data,
      };

      console.log("Submitting income details payload:", payload); // Debugging log

      const response = await fetch("http://localhost:5000/api/income-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email, // Send email in the headers
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Income details saved successfully.");
        onSubmit?.(data);
      } else {
        const error = await response.json();
        console.error("Error saving income details:", error);
        toast.error(error.error || "Failed to save income details.");
      }
    } catch (error) {
      console.error("Error saving income details:", error);
      toast.error("An error occurred while saving income details.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Income Details
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Please provide your income and employment details to help us evaluate
        your loan eligibility. Fields marked with * are mandatory.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type *</FormLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="">Select employment type</option>
                    <option value="Salaried">Salaried</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Business owner">Business owner</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Retired">Retired</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Name/Business Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter employer or business name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income (₹) *</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., 50000" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearsEmployed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years at Current Employment/Business *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., 3.5"
                      type="number"
                      step="0.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="existingLoans"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any Existing Loans? *</FormLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="loanAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Loan Amount (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., 200000"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loanPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Purpose *</FormLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="">Select loan purpose</option>
                    <option value="Home renovation">Home renovation</option>
                    <option value="Debt consolidation">
                      Debt consolidation
                    </option>
                    <option value="Education">Education</option>
                    <option value="Medical expenses">Medical expenses</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit">Submit Income Details</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default IncomeDetailsForm;
