
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { X, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the days and time slots for the picker
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = [
  '9:00 AM', '10:00 AM', '11:00 AM', 
  '2:00 PM', '3:00 PM', '4:00 PM'
];

interface AvailabilitySlot {
  day: string;
  time: string;
}

interface AvailabilityPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const AvailabilityPicker = ({ value, onChange, className }: AvailabilityPickerProps) => {
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);
  const [selectedTime, setSelectedTime] = useState<string>(TIMES[0]);
  
  // Parse existing value into slot objects
  const slots = value.map(slot => {
    const [day, time] = slot.split(' ').reduce((acc, part, index) => {
      if (index === 0) acc[0] = part;
      else if (acc[1]) acc[1] += ' ' + part;
      else acc[1] = part;
      return acc;
    }, ['', ''] as [string, string]);
    
    return { day, time };
  });
  
  // Add a new availability slot
  const addSlot = () => {
    const newSlot = `${selectedDay} ${selectedTime}`;
    if (!value.includes(newSlot)) {
      onChange([...value, newSlot]);
    }
  };
  
  // Remove an availability slot
  const removeSlot = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-2 items-start">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {DAYS.map(day => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TIMES.map(time => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Button 
          type="button" 
          variant="outline"
          className="w-full sm:w-auto flex items-center justify-center"
          onClick={addSlot}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Time
        </Button>
      </div>
      
      {value.length > 0 ? (
        <div className="border rounded-md p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-tutorblue-500" />
            Your Available Time Slots
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {value.map((slot, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-white px-3 py-2 rounded-md border"
              >
                <span className="text-sm">{slot}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => removeSlot(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-4 border rounded-md border-dashed text-muted-foreground">
          No availability set. Add your available time slots.
        </div>
      )}
    </div>
  );
};

export default AvailabilityPicker;
