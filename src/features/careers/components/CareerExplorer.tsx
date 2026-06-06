import { useState } from "react";
import { Search } from "lucide-react";
import { CareerCard } from "./CareerCard";
import { 
  useCatalog, 
  Page, 
  Toolbar, 
  CardGrid, 
  Input, 
  Button, 
  categories 
} from "../../../shared";

export function CareerExplorer() {
  const { careers } = useCatalog();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = careers.filter(
    (career) => 
      (category === "All" || career.category === category) && 
      `${career.title} ${career.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Page title="Career Explorer" subtitle="Search career paths and map them to majors and colleges.">
      <Toolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <Input 
            className="pl-10" 
            placeholder="Search careers" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </Toolbar>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...categories].map((cat) => (
          <Button 
            key={cat} 
            variant={category === cat ? "primary" : "outline"} 
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <CardGrid items={filtered} render={(career) => <CareerCard career={career} />} />
    </Page>
  );
}
