
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SUBJECTS, TIME_SLOTS, UserRole } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import AvailabilityPicker from './AvailabilityPicker';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('learner');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  // Define form schema based on type
  const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  });

  const registerSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  });

  const formSchema = type === 'login' ? loginSchema : registerSchema;

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (type === 'register') {
        // For registration, add subjects and availability
        if (selectedSubjects.length === 0 && selectedRole === 'tutor') {
          toast.error('Please select at least one subject');
          setIsSubmitting(false);
          return;
        }
        
        if (selectedTimeSlots.length === 0 && selectedRole === 'tutor') {
          toast.error('Please select at least one availability time slot');
          setIsSubmitting(false);
          return;
        }
        
        await onSubmit({
          ...values,
          role: selectedRole,
          subjects: selectedSubjects,
          availability: selectedTimeSlots,
        });
      } else {
        // For login, just submit email and password
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="you@example.com" 
                  {...field} 
                  className="input-field"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field}
                  className="input-field" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === 'register' && (
          <>
            <div>
              <FormLabel>I want to</FormLabel>
              <Select 
                onValueChange={(value: UserRole) => {
                  setSelectedRole(value);
                }}
                defaultValue={selectedRole}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learn from tutors</SelectItem>
                  <SelectItem value="tutor">Become a tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'tutor' && (
              <>
                <div className="space-y-3">
                  <FormLabel>Subjects you can teach</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`subject-${subject}`}
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={() => toggleSubject(subject)}
                        />
                        <label
                          htmlFor={`subject-${subject}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {subject}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <FormLabel>Your availability</FormLabel>
                  <AvailabilityPicker 
                    value={selectedTimeSlots}
                    onChange={setSelectedTimeSlots}
                  />
                </div>
              </>
            )}
          </>
        )}

        <Button 
          type="submit" 
          className="w-full bg-tutorblue-500 hover:bg-tutorblue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{type === 'login' ? 'Signing in...' : 'Creating account...'}</span>
            </div>
          ) : (
            <span>{type === 'login' ? 'Sign in' : 'Create account'}</span>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AuthForm;
