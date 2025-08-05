import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { EnhancedPost, PostComment, PostLike } from '../types/social';
import toast from 'react-hot-toast';

export const useSocialFeatures = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Load posts with engagement data
  const loadPosts = useCallback(async (category?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          post_likes(count),
          post_comments(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user's likes for these posts
      const postIds = data?.map(p => p.id) || [];
      const { data: userLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);

      const enhancedPosts: EnhancedPost[] = data?.map(post => ({
        ...post,
        likes_count: post.post_likes?.[0]?.count || 0,
        comments_count: post.post_comments?.[0]?.count || 0,
        user_has_liked: likedPostIds.has(post.id)
      })) || [];

      setPosts(enhancedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new post
  const createPost = useCallback(async (content: string, imageUrl?: string, category: string = 'all') => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, verified')
        .eq('user_id', user.id)
        .single();

      const postData = {
        user_id: user.id,
        author_id: user.id,
        author_name: profile?.name || 'Anonymous',
        author_title: userRole?.role === 'doctor' ? 'Doctor' : 'Patient',
        author_avatar: profile?.avatar_url || '',
        author_verified: userRole?.verified || false,
        content,
        image_url: imageUrl,
        category,
        post_type: 'text',
        is_public: true,
        tags: [],
        metadata: {}
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newPost: EnhancedPost = {
        ...data,
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false
      };

      setPosts(prev => [newPost, ...prev]);
      toast.success('Post created successfully!');
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      throw error;
    }
  }, [user]);

  // Like/unlike a post
  const toggleLike = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1, user_has_liked: false }
            : post
        ));
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1, user_has_liked: true }
            : post
        ));

        // Create notification for post author
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== user.id) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: post.user_id,
              type: 'chat',
              title: 'New Like',
              message: `${post.author_name} liked your post`,
              metadata: { post_id: postId, from_user_id: user.id }
            }]);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  }, [user, posts]);

  // Add comment to post
  const addComment = useCallback(async (postId: string, content: string, parentCommentId?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content,
          parent_comment_id: parentCommentId
        }])
        .select('*')
        .single();

      if (error) throw error;

      // Update post comments count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));

      // Create notification for post author
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: post.user_id,
            type: 'chat',
            title: 'New Comment',
            message: `${post.author_name} commented on your post`,
            metadata: { post_id: postId, comment_id: data.id, from_user_id: user.id }
          }]);
      }

      toast.success('Comment added!');
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  }, [user, posts]);

  // Initialize data
  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user, loadPosts]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const postsSubscription = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        loadPosts();
      })
      .subscribe();

    const likesSubscription = supabase
      .channel('likes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {
        loadPosts();
      })
      .subscribe();

    const commentsSubscription = supabase
      .channel('comments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      likesSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [user, loadPosts]);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    addComment,
    loadPosts
  };
};