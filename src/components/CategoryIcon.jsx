import React from 'react';
import * as Icons from 'lucide-react';

export const CategoryIcon = ({ name, className = "w-5 h-5", color }) => {
  const IconComponent = Icons[name] || Icons.CircleDollarSign;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};

export default CategoryIcon;
