export const getStatusBadgeColor = ( status: string ) => {
    
    switch (status) {
        case "completed":
            return "bg-green-900/20 text-green-400";
        
        case "in_progress":
            return "bg-blue-900/20 text-blue-400";
        
        case "cancelled":
            return "bg-gray-800 text-gray-400";
    
        default:
            return "bg-yellow-900/20 text-yellow-400";
    }
};

export const getPriorityBadgeColor = (priority: string) => {

    switch (priority) {
        case "urgent":
            return "bg-red-900/20 text-red-400"
        
        case "high":
            return "bg-orange-900/20 text-orange-400";
        
        case "medium":
            return "bg-blue-900/20 text-blue-400";
    
        default:
            return "bg-gray-800 text-gray-400";
    }
}