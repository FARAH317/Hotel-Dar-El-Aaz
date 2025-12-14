const Loading = ({ fullScreen = false, text = 'Chargement...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-[#E5D4A6] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#C9A961] border-t-transparent rounded-full animate-spin"></div>
          </div>
          {text && (
            <p 
              className="text-[#6B5D4F] font-medium" 
              style={{fontFamily: 'Montserrat, sans-serif'}}
            >
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-3">
          <div className="absolute inset-0 border-3 border-[#E5D4A6] rounded-full"></div>
          <div className="absolute inset-0 border-3 border-[#C9A961] border-t-transparent rounded-full animate-spin"></div>
        </div>
        {text && (
          <p 
            className="text-[#6B5D4F] text-sm font-medium" 
            style={{fontFamily: 'Montserrat, sans-serif'}}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;