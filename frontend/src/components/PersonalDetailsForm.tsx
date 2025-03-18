import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

interface PersonalDetailsFormProps {
  initialData?: {
    email?: string;
    name?: string;
    dob?: string;
    gender?: string;
    address?: string;
    phone?: string;
  };
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  dob: z.string(),
  gender: z.string(),
  address: z
    .string()
    .min(10, { message: "Please enter your complete address" }),
  city: z.string().min(2, { message: "Please enter your city" }),
  state: z.string().min(2, { message: "Please enter your state" }),
  pincode: z.string().min(6, { message: "Please enter a valid PIN code" }),
});

const PersonalDetailsForm = ({
  initialData = {},
  onSubmit,
}: PersonalDetailsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData.email || "",
      name: initialData.name || "",
      phone: initialData.phone || "",
      dob: initialData.dob || "",
      gender: initialData.gender || "",
      address: initialData.address || "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const loggedInEmail = localStorage.getItem("email"); // Retrieve logged-in user's email
      if (!loggedInEmail) {
        toast.error("User email is missing. Please log in again.");
        return;
      }

      if (data.email !== loggedInEmail) {
        toast.error("The entered email does not match your account email.");
        return;
      }

      const payload = {
        email: loggedInEmail, // Use the logged-in email
        ...data,
      };

      console.log("Submitting personal details payload:", payload); // Debugging log

      const response = await fetch(
        "http://localhost:5000/api/personal-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("Personal details saved successfully.");
        onSubmit?.(data);
      } else {
        const error = await response.json();
        console.error("Error saving personal details:", error);
        toast.error(error.error || "Failed to save personal details.");
      }
    } catch (error) {
      console.error("Error saving personal details:", error);
      toast.error("An error occurred while saving personal details.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Personal Details
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Please provide your personal details to continue with the loan
        application. Fields marked with * are mandatory.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    {...field}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residential Address *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="House/Flat No, Building, Street"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="6-digit PIN code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit">Submit Personal Details</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalDetailsForm;
