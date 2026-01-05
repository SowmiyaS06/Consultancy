import { Category } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/products?category=${category.id}`}>
      <div className="bg-card rounded-xl p-6 shadow-card card-hover border border-border/50 h-full group">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {category.icon}
        </div>
        <h3 className="font-bold text-lg text-foreground mb-2">{category.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {category.productCount} products
          </span>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <span className="text-primary text-sm font-medium">Shop Now →</span>
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
