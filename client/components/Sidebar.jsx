import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  FileText,
  FolderOpen,
  MoreVertical,
  ChevronLast,
  ChevronFirst,
} from 'lucide-react';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const sidebarWidth = expanded ? 'w-64' : 'w-16';

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <aside className={`${sidebarWidth} fixed left-0 top-0 h-screen z-50 transition-all duration-300 bg-blue-100`}>
      <nav className="h-full flex flex-col border-r border-blue-300 shadow-lg">
        <div className="p-4 pb-2 flex justify-between items-center">
          <h2 className={`text-blue-700 font-bold text-xl pl-5 transition-all overflow-hidden ${expanded ? "w-auto pl-2" : "w-0 pl-0"}`}>RAGenotes</h2>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-blue-200 hover:bg-blue-300">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>
        <div className="flex-1 px-2 overflow-hidden space-y-2">
          {expanded && <div className="text-blue-500 uppercase text-xs font-bold mt-4 pl-1">Classroom</div>}
          <button onClick={() => handleNavigate('/teacher-dashboard')} className="w-full flex items-center py-2 px-3 my-1 font-medium rounded-md hover:bg-blue-200 text-white">
            <PlayCircle size={20} />
            {expanded && <span className="ml-3">Start Class</span>}
          </button>
          <button onClick={() => handleNavigate('/my-moms')} className="w-full flex items-center py-2 px-3 my-1 font-medium rounded-md hover:bg-blue-200 text-white">
            <FileText size={20} />
            {expanded && <span className="ml-3">My MoMs</span>}
          </button>
          <button onClick={() => handleNavigate('/share-files')} className="w-full flex items-center py-2 px-3 my-1 font-medium rounded-md hover:bg-blue-200 text-white">
            <FolderOpen size={20} />
            {expanded && <span className="ml-3">Share Files</span>}
          </button>
        </div>
        <div className="border-t flex p-3 items-center">
          <img src="https://media.istockphoto.com/id/849863560/vector/r-icon.jpg?s=612x612&w=0&k=20&c=tsRXA5jE3Fa_MCYexGtf7rKKEwtIblkhX2H64T8sDII=" alt="Avatar" className="w-10 h-10 rounded-md" />
          {expanded && (
            <div className="ml-3 flex justify-between items-center w-full">
              <div><h2 className="font-semibold text-blue-800">Teacher Login</h2></div>
              <MoreVertical size={20} />
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
