export default function LoadingSpinner({ fullScreen = false }) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );
}
