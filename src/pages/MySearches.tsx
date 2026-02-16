import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Search, Trash2, Clock, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SavedSearch {
  id: string;
  label: string;
  filters: Record<string, string>;
  createdAt: string;
}

const MySearches = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mcd-saved-searches');
    if (stored) {
      try {
        setSearches(JSON.parse(stored));
      } catch { /* empty */ }
    }
  }, []);

  const removeSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    localStorage.setItem('mcd-saved-searches', JSON.stringify(updated));
  };

  const clearAll = () => {
    setSearches([]);
    localStorage.removeItem('mcd-saved-searches');
  };

  return (
    <div className="container mx-auto px-4 py-10 min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Search className="w-7 h-7 text-primary" />
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {t('mySearches.title')}
          </h1>
        </div>
        {searches.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-1.5" />
            {t('mySearches.clearAll')}
          </Button>
        )}
      </div>

      {/* Empty state */}
      {searches.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('mySearches.empty')}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('mySearches.emptyDesc')}</p>
          <Link to={`/${lang}/search`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('mySearches.startSearch')}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-6">
            {t('mySearches.count', { count: searches.length })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searches.map((search) => (
              <Card key={search.id} className="card-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{search.label}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(search.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(search.filters).map(([key, value]) => (
                        <span key={key} className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Link to={`/${lang}/search?${new URLSearchParams(search.filters).toString()}`}>
                      <Button size="sm" variant="outline">
                        <Search className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => removeSearch(search.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MySearches;
