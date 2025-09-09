import { auth } from "@/auth";
import { getAllScreeners } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Clock,
  Plus,
  Edit,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import DeleteScreenerButton from "./delete-screener-button";
import AddScreenerDialog from "@/components/Dialogs/create-screener-dialog";

export const metadata = {
  title: "Screeners",
  description: "Manage and view your deal screening criteria",
};

const Screeners = async () => {
  const userSession = await auth();

  if (!userSession) redirect("/login");

  const screeners = await getAllScreeners();

  return (
    <div className="block-space big-container">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Screeners</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your deal screening criteria and evaluation rules
            </p>
          </div>
          <AddScreenerDialog />
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Screeners
                </p>
                <p className="text-2xl font-bold">{screeners?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Rules
                </p>
                <p className="text-2xl font-bold">{screeners?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Evaluations
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screeners Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Screeners</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {screeners && screeners.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {screeners.map((screener) => (
              <Card
                key={screener.id}
                className="group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {screener.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created</span>
                      </div>
                      <span className="font-medium">
                        {new Date(screener.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Updated</span>
                      </div>
                      <span className="font-medium">
                        {new Date(screener.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-2 border-t pt-4">
                    <Button size="sm" className="flex-1 gap-2">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <DeleteScreenerButton screenerId={screener.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No screeners found</h3>
            <p className="mb-6 text-muted-foreground">
              Create your first screener to start evaluating deals with custom
              criteria.
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Screener
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Screeners;
