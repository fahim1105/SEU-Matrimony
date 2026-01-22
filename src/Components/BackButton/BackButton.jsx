import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const BackButton = ({ 
    to = null, 
    label = 'ফিরে যান', 
    className = '',
    variant = 'ghost' // ghost, primary, secondary
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    const baseClasses = "btn gap-2 mb-4";
    const variantClasses = {
        ghost: "btn-ghost",
        primary: "btn-primary",
        secondary: "btn-secondary"
    };

    return (
        <button
            onClick={handleBack}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </button>
    );
};

export default BackButton;