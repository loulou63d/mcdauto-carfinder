const CategorySvg = ({ type }: { type: string }) => {
  const cls = "w-full h-full";
  switch (type) {
    case 'suv':
      return (
        <svg viewBox="0 0 120 50" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 38h8a7 7 0 0 1 14 0h36a7 7 0 0 1 14 0h18c2 0 4-1 4-3V28l-8-10c-1-1.5-3-2.5-5-2.5H68l-12-6H32c-3 0-6 1.5-8 4l-8 10-8 3v8c0 2 1.5 3.5 4 3.5z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="25" cy="38" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="89" cy="38" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M30 18h24l8 10H18z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
        </svg>
      );
    case 'berline':
      return (
        <svg viewBox="0 0 120 50" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 36h10a7 7 0 0 1 14 0h40a7 7 0 0 1 14 0h14c3 0 5-2 5-4v-4l-4-4-14-8H70l-16-6H34c-3 0-5 1-7 3l-10 11-9 4v4c0 2 1 4 4 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="25" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="89" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M34 16h20l12 8H24z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
        </svg>
      );
    case 'break':
      return (
        <svg viewBox="0 0 120 50" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 36h10a7 7 0 0 1 14 0h40a7 7 0 0 1 14 0h14c3 0 5-2 5-4V20l-2-2H90l-14-6H38c-3 0-5 1-7 3L20 26l-12 2v4c0 2 1 4 4 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="25" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="89" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M38 14h32l8 10H28z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
          <line x1="88" y1="14" x2="88" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        </svg>
      );
    case 'utilitaire':
      return (
        <svg viewBox="0 0 120 55" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 42h10a7 7 0 0 1 14 0h44a7 7 0 0 1 14 0h12c3 0 5-2 5-4V18c0-3-2-5-5-5H70v-3c0-2-2-4-4-4H14c-3 0-5 2-5 5v31z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="23" cy="42" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="91" cy="42" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <rect x="74" y="18" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
          <line x1="66" y1="8" x2="66" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        </svg>
      );
    case '4x4':
      return (
        <svg viewBox="0 0 120 55" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 40h6a8 8 0 0 1 16 0h36a8 8 0 0 1 16 0h16c3 0 5-2 5-4V28l-10-12c-1-2-3-3-5-3H64l-10-5H30c-3 0-6 2-8 4L12 24l-6 4v8c0 2 1 4 4 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="24" cy="40" r="6.5" stroke="currentColor" strokeWidth="2.5"/>
          <circle cx="84" cy="40" r="6.5" stroke="currentColor" strokeWidth="2.5"/>
          <path d="M28 16h22l8 10H18z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
          <line x1="60" y1="28" x2="60" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        </svg>
      );
    case 'cabriolet':
      return (
        <svg viewBox="0 0 120 50" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 36h10a7 7 0 0 1 14 0h40a7 7 0 0 1 14 0h14c3 0 5-2 5-4v-4l-6-4H80l-8-10H42c-3 0-5 1-6 3l-8 7H10l-4 4v4c0 2 1 4 4 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="25" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="89" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M42 14h28l6 10H36z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
        </svg>
      );
    case 'monospace':
      return (
        <svg viewBox="0 0 120 55" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 40h10a7 7 0 0 1 14 0h40a7 7 0 0 1 14 0h14c3 0 5-2 5-4V18c0-2-1-4-3-5l-12-3H38l-14 4-10 10-6 4v8c0 2 1 4 4 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="25" cy="40" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="89" cy="40" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M38 12h50v16H28z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
          <line x1="60" y1="12" x2="60" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        </svg>
      );
    case 'coupé':
      return (
        <svg viewBox="0 0 120 50" className={cls} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 36h10a7 7 0 0 1 14 0h40a7 7 0 0 1 14 0h14c3 0 5-2 5-4v-4l-6-6-18-6H60l-20-4H28c-2 0-4 1-5 3l-9 10-8 3v4c0 2 1 4 4 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
          <circle cx="25" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <circle cx="89" cy="36" r="5.5" stroke="currentColor" strokeWidth="2.2"/>
          <path d="M30 16h28l14 8H22z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
        </svg>
      );
    default:
      return null;
  }
};

export default CategorySvg;
