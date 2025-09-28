"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { SkillForm } from "@/components/admin/skill-form-simple";
import { createClient } from "@/lib/supabase/client";
import { createSkillAction, updateSkillAction, deleteSkillAction, deleteAllSkillsAction, updateSkillRelationshipsAction } from "../../app/actions/admin-actions";
import type { Skill, SkillType, CategoryType } from "@/lib/database/queries";
import type { CreateSkillData, UpdateSkillData } from "@/lib/database/admin-queries";

type ViewMode = 'list' | 'create' | 'edit';

export function AdminDashboard() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSkill, setSelectedSkill] = useState<Skill | undefined>();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    initializeAdminDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAdminDashboard = async () => {
    try {
      const supabase = createClient();
      
      // First, verify user and role
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      setUserRole(profile.role);
      
      // Only load skills after confirming user role
      await loadSkills();
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    filterSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills, searchTerm, selectedCategory]);

  const loadSkills = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('difficulty', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = skills;

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    setFilteredSkills(filtered);
  };

  const handleCreateSkill = async (data: CreateSkillData | UpdateSkillData) => {
    if (userRole !== 'Admin') {
      alert('Only admins can create skills. Your role: ' + userRole);
      return;
    }

    // Ensure we're working with CreateSkillData (no id field)
    const createData = data as CreateSkillData;

    setActionLoading(true);
    try {
      console.log('Creating skill with data:', createData);
      
      const result = await createSkillAction(createData);

      if (!result.success) {
        console.error('Create skill error:', result.error);
        throw new Error(result.error);
      }

      console.log('Skill created successfully:', result.data);
      
      // Refresh skills list
      await loadSkills();
      
      setViewMode('list');
      alert('Skill created successfully!');
    } catch (error) {
      console.error('Error creating skill:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create skill: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSkill = async (data: CreateSkillData | UpdateSkillData) => {
    if (userRole !== 'Admin') {
      alert('Only admins can update skills. Your role: ' + userRole);
      return;
    }

    // Ensure we're working with UpdateSkillData (has id field)
    const updateData = data as UpdateSkillData;

    setActionLoading(true);
    try {
      const { id, ...skillData } = updateData;
      
      console.log('Updating skill with data:', { id, skillData });
      
      const result = await updateSkillAction({ id, ...skillData });

      if (!result.success) {
        console.error('Update skill error:', result.error);
        throw new Error(result.error);
      }

      console.log('Skill updated successfully:', result.data);
      
      // Update relationships separately if they changed
      if (result.data) {
        const relationshipResult = await updateSkillRelationshipsAction(
          id,
          skillData.previous_skills || [],
          skillData.next_skills || []
        );
        if (!relationshipResult.success) {
          console.warn('Failed to update skill relationships:', relationshipResult.error);
        }
      }
      
      // Refresh skills list
      await loadSkills();
      
      setViewMode('list');
      setSelectedSkill(undefined);
      alert('Skill updated successfully!');
    } catch (error) {
      console.error('Error updating skill:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update skill: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (userRole !== 'Admin') {
      alert('Only admins can delete skills. Your role: ' + userRole);
      return;
    }

    if (!confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      console.log('Attempting to delete skill:', skillId);
      
      const result = await deleteSkillAction(skillId);

      if (!result.success) {
        console.error('Delete skill error:', result.error);
        throw new Error(result.error);
      }

      console.log('Skill deleted successfully');
      
      // Refresh skills list
      await loadSkills();
      
      alert('Skill deleted successfully!');
    } catch (error) {
      console.error('Error deleting skill:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete skill: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllSkills = async () => {
    if (userRole !== 'Admin') {
      alert('Only admins can delete all skills. Your role: ' + userRole);
      return;
    }

    const confirmMessage = `🚨 DANGER: This will permanently delete ALL ${skills.length} skills and ALL user achievements!\n\nThis action cannot be undone.\n\nType "DELETE ALL" to confirm:`;
    const userInput = prompt(confirmMessage);
    
    if (userInput !== 'DELETE ALL') {
      return;
    }

    setActionLoading(true);
    try {
      console.log('Starting delete all skills operation...');
      
      const result = await deleteAllSkillsAction();

      if (!result.success) {
        console.error('Delete all skills error:', result.error);
        throw new Error(result.error);
      }

      console.log('Delete all operation completed successfully');
      setSkills([]);
      alert('All skills and user achievements have been deleted successfully.');
    } catch (error) {
      console.error('Error deleting all skills:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete all skills: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getTypeColor = (type: SkillType) => {
    switch (type) {
      case 'Milestone': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Variation': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (viewMode === 'create') {
    return (
      <AdminGuard>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Create New Skill</h1>
            <Button variant="outline" onClick={() => setViewMode('list')}>
              Back to Skills
            </Button>
          </div>
          <SkillForm
            availableSkills={skills}
            onSubmit={handleCreateSkill}
            onCancel={() => setViewMode('list')}
            isLoading={actionLoading}
          />
        </div>
      </AdminGuard>
    );
  }

  if (viewMode === 'edit' && selectedSkill) {
    return (
      <AdminGuard>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Skill</h1>
            <Button variant="outline" onClick={() => {
              setViewMode('list');
              setSelectedSkill(undefined);
            }}>
              Back to Skills
            </Button>
          </div>
          <SkillForm
            skill={selectedSkill}
            availableSkills={skills}
            onSubmit={handleUpdateSkill}
            onCancel={() => {
              setViewMode('list');
              setSelectedSkill(undefined);
            }}
            isLoading={actionLoading}
          />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Skills Administration</h1>
            <p className="text-muted-foreground">Manage exercise skills and progressions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setViewMode('create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Skill
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllSkills}
              disabled={actionLoading || skills.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Skills
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Total Skills</p>
                  <p className="text-2xl font-bold">{skills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-2">
                  <p className="text-sm font-medium">Push</p>
                  <p className="text-2xl font-bold">
                    {skills.filter(s => s.category === 'Push').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-2">
                  <p className="text-sm font-medium">Pull</p>
                  <p className="text-2xl font-bold">
                    {skills.filter(s => s.category === 'Pull').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="ml-2">
                  <p className="text-sm font-medium">Legs</p>
                  <p className="text-2xl font-bold">
                    {skills.filter(s => s.category === 'Legs').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType | 'all')}
                className="flex h-9 w-full md:w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">All Categories</option>
                <option value="Push">Push</option>
                <option value="Pull">Pull</option>
                <option value="Legs">Legs</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Skills List */}
        <Card>
          <CardHeader>
            <CardTitle>Skills ({filteredSkills.length})</CardTitle>
            <CardDescription>
              Manage your exercise database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading skills...</p>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No skills found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSkills.map((skill) => (
                  <Card key={skill.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{skill.name}</h3>
                          <Badge className={getDifficultyColor(skill.difficulty)}>
                            Level {skill.difficulty}
                          </Badge>
                          <Badge className={getTypeColor(skill.type)}>
                            {skill.type}
                          </Badge>
                          <Badge variant="outline">
                            {skill.category}
                          </Badge>
                        </div>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {skill.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Previous: {skill.previous_skills?.length || 0}</span>
                          <span>Next: {skill.next_skills?.length || 0}</span>
                          <span>Variations: {skill.variations?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSkill(skill);
                            setViewMode('edit');
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id)}
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
}