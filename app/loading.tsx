import { HomePageSkeleton } from "@/components/layout/skeletons/PageSkeletons";

// Shown instantly during navigation to the home route while its server
// component awaits the (remote) catalog data — keeps transitions responsive.
export default function HomeLoading() {
  return <HomePageSkeleton />;
}
