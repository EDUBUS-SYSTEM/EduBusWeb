'use client';

import React from 'react';
import { ChevronLeft, User, Users } from 'lucide-react';

export type AccountType = 'driver' | 'parent';

interface SidebarCreateAccountProps {
  activeAccountType: AccountType;
  onAccountTypeChange: (type: AccountType) => void;
  onBack: () => void;
}

const SidebarCreateAccount: React.FC<SidebarCreateAccountProps> = ({
  activeAccountType,
  onAccountTypeChange,
  onBack,
}) => {
  const accountTypes = [
    {
      type: 'driver' as AccountType,
      label: 'Driver Account',
      icon: User,
      description: 'Driver account',
    },
    {
      type: 'parent' as AccountType,
      label: 'Parent Account',
      icon: Users,
      description: 'Parent account',
    },
  ];

  return (
    <div className="w-80 bg-yellow-50 min-h-screen p-6 flex flex-col">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span className="font-medium">Back</span>
      </button>

      {/* Account Type Navigation */}
      <div className="space-y-4">
        {accountTypes.map((accountType) => {
          const Icon = accountType.icon;
          const isActive = activeAccountType === accountType.type;
          
          return (
            <button
              key={accountType.type}
              onClick={() => onAccountTypeChange(accountType.type)}
              className={`
                w-full p-4 rounded-xl transition-all duration-300
                flex items-center space-x-3
                                 ${isActive 
                   ? 'bg-yellow-200 border-2 border-yellow-300 shadow-md' 
                   : 'bg-[#F9F7E3] border-2 border-transparent hover:bg-yellow-100 hover:border-yellow-200'
                 }
              `}
            >
              <div className={`
                p-2 rounded-lg
                ${isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className={`
                  font-semibold text-sm
                  ${isActive ? 'text-gray-800' : 'text-gray-700'}
                `}>
                  {accountType.label}
                </div>
                <div className="text-xs text-gray-500">
                  {accountType.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarCreateAccount;
