import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('should display the title', async ({ page }) => {
  const title = await page.getByRole('heading', { name: 'Suffrage anonyme' });
  await expect(title).toBeVisible();
});

test('should display the description section', async ({ page }) => {
  const descriptionTitle = await page.getByText('Comment ça marche ?');
  await expect(descriptionTitle).toBeVisible();

  const descriptionContent = await page.getByText(/Un seul téléphone circule parmi les participants/);
  await expect(descriptionContent).toBeVisible();
});

test('should have a button to create a new vote', async ({ page }) => {
  const createVoteButton = await page.getByRole('button', { name: '+ Créer un nouveau vote' });
  await expect(createVoteButton).toBeVisible();
});

test('should display recent votes if available', async ({ page }) => {
  const recentVotesTitle = await page.getByText('Votes récents');
  await expect(recentVotesTitle).toBeVisible();

  const voteItem = await page.getByRole('button').filter({ has: page.getByText(/votants/) }).first();
  await expect(voteItem).toBeVisible();
});

test('should have a link to view all votes', async ({ page }) => {
  const viewAllVotesLink = await page.getByRole('link', { name: 'Voir tous les votes →' });
  await expect(viewAllVotesLink).toBeVisible();
});