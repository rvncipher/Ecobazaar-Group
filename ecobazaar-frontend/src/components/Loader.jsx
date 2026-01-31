import PropTypes from 'prop-types';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-[3px]',
    medium: 'w-12 h-12 border-4',
    large: 'w-18 h-18 border-[6px]',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={`${sizeClasses[size]} border-gray-200 border-t-green-500 rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
};

export default Loader;
