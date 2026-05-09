jest.mock('expo-router');
import { render, screen, fireEvent } from '@testing-library/react-native';
import Home from '../app/index';
import { getVotes } from '$lib/votesStorage';

describe('Home Component', () => {
  const mockVotes = [
    { id: '1', title: 'Vote 1', voters: [{ hasVoted: true }, { hasVoted: false }] },
    { id: '2', title: 'Vote 2', voters: [] },
    { id: '3', title: 'Vote 3', voters: [{ hasVoted: true }] },
  ];

  beforeEach(() => {
    jest.mocked(getVotes).mockResolvedValue(mockVotes);
  });

  it('renders the title and description correctly', async () => {
    render(<Home />);
    expect(await screen.findByText('Suffrage anonyme')).toBeOnTheScreen();
    expect(screen.getByText('Comment ça marche ?')).toBeOnTheScreen();
    expect(screen.getByText(/Un seul téléphone circule parmi les participants/)).toBeOnTheScreen();
  });

  it('renders the create new vote button correctly', async () => {
    render(<Home />);
    const createButton = await screen.findByText('+ Créer un nouveau vote');
    expect(createButton).toBeOnTheScreen();
    fireEvent.press(createButton);
    expect(router.push).toHaveBeenCalledWith('/create');
  });

  it('displays recent votes when available', async () => {
    render(<Home />);
    expect(await screen.findByText('Votes récents')).toBeOnTheScreen();
    expect(screen.getByText('Vote 1')).toBeOnTheScreen();
    expect(screen.getByText('Vote 2')).toBeOnTheScreen();
    expect(screen.getByText('Vote 3')).toBeOnTheScreen();
  });

  it('displays the correct vote progress labels', async () => {
    render(<Home />);
    expect(await screen.findByText('En cours 1/2')).toBeOnTheScreen();
    expect(screen.getByText('À venir')).toBeOnTheScreen();
    expect(screen.getByText('✓ Terminé')).toBeOnTheScreen();
  });

  it('navigates to the correct vote detail page when a vote is pressed', async () => {
    render(<Home />);
    const voteButton = await screen.findByText('Vote 1');
    fireEvent.press(voteButton);
    expect(router.push).toHaveBeenCalledWith('/votes/1');
  });

  it('displays the see all votes link and navigates correctly', async () => {
    render(<Home />);
    const seeAllVotesLink = await screen.findByText('Voir tous les votes →');
    fireEvent.press(seeAllVotesLink);
    expect(router.push).toHaveBeenCalledWith('/votes');
  });
});