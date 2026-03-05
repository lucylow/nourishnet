import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/ai": "AI Chat",
  "/ai/vision": "Vision",
  "/ai/agents": "Agent Orchestration",
  "/ai/blockchain": "Blockchain Impact",
  "/ai/recipes": "Recipe Bundles",
  "/ai/marl": "MARL Pricing",
  "/pricing": "Pricing",
  "/bundles": "EBT Bundles",
  "/business": "Business Dashboard",
  "/shelter": "Shelter Queue",
  "/explorer": "Impact Explorer",
  "/dao": "DAO",
  "/about": "About",
  "/impact": "Impact",
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();

  if (pathname === "/") return null;

  // Build breadcrumb chain
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; path: string }[] = [{ label: "Home", path: "/" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, path: currentPath });
  }

  return (
    <div className="container mx-auto px-4 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <BreadcrumbItem key={crumb.path}>
                {i > 0 && <BreadcrumbSeparator />}
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
