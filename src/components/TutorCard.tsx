
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Award, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface TutorCardProps {
  tutor: UserProfile;
  selectedTime: string;
  selectedSubject: string;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor, selectedTime, selectedSubject }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookSession = () => {
    setIsDialogOpen(true);
  };

  const confirmBooking = () => {
    setIsLoading(true);
    // Simulate blockchain transaction
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(false);
      toast.success(`Session booked with ${tutor.email} successfully!`);
    }, 1500);
  };

  // Get user's first name from email
  const firstName = tutor.email.split('@')[0].split('.')[0];
  // Capitalize first letter
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  return (
    <>
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-scale">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-tutorblue-100 flex items-center justify-center text-tutorblue-600 font-bold text-lg">
                  {displayName.charAt(0)}
                </div>
                {tutor.role === 'tutor' && (
                  <div className="absolute -bottom-1 -right-1 bg-tutorblue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    Pro
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{displayName}</h3>
                <p className="text-sm text-gray-500">{tutor.email}</p>
              </div>
            </div>
            <div className="flex items-center text-tutorblue-500">
              <DollarSign size={16} />
              <span className="font-semibold">{tutor.hourlyRate}/hr</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-2">{tutor.bio}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Award size={16} className="mr-2 text-tutorblue-400" />
              <span>Teaches: {tutor.subjects.join(', ')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2 text-tutorblue-400" />
              <span>Available: {tutor.availability.length} time slots</span>
            </div>
          </div>
          
          <div className="bg-tutorblue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-tutorblue-800">
                <Clock size={15} className="mr-1.5" />
                <span>{selectedTime}</span>
              </div>
              <div className="font-medium text-tutorblue-800">{selectedSubject}</div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-tutorblue-500 hover:bg-tutorblue-600 text-white"
            onClick={handleBookSession}
          >
            Book Session
          </Button>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Tutor</p>
              <p className="text-sm text-gray-700">{displayName} ({tutor.email})</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-gray-700">{selectedSubject}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-gray-700">{selectedTime}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm text-gray-700">${tutor.hourlyRate}.00</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                Payment will be processed using blockchain technology. This is a placeholder for Thirdweb integration with EDU Chain.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-tutorblue-500 hover:bg-tutorblue-600"
              onClick={confirmBooking}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TutorCard;
