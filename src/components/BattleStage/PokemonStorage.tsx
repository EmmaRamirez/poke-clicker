import React, { useState } from 'react';
import {stylesheet, classes} from 'typestyle';
import { DialogKind, Dialog } from 'components/Dialog';
import { State } from 'state';
import { useSelector } from 'react-redux';
import { StyledSprite } from 'components/Party/StyledSprite';
import { colors } from 'utils';
import { Button } from 'components/Button';
import { PartyPokemon } from 'utils';
import { PokemonView } from 'components/PokemonView';


const styles = stylesheet({
    Dialog: {
        flexDirection: 'column',
        overflowY: 'auto',
        border: '1px solid black',
        borderColor: colors.primary.shade2,
        position: 'relative',
        height: '100%',
    },
    StorageContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        padding: '0.25rem',
    },
    StoragePokemon: {
        background: `linear-gradient(to top, ${colors.black.fadeOut4}, ${colors.black.fadeOut3})`,
        border: '1px solid transparent',
        borderRadius: '.25rem',
        cursor: 'pointer',
        margin: '2px',
        height: '80px',
        width: '80px',
        position: 'relative',
        $nest: {
            '&:hover': {
                borderColor: colors.white.get(),
            }
        }
    },
    StoragePokemonSelected: {
        border: '1px dashed gold',
    },
    StorageBar: {
        //height: '2rem',
        width: '100%',
        background: colors.primary.shade1,
        marginBottom: '.5rem',
        padding: '0.5rem',
        display: 'flex',
    },
    SearchBar: {
        marginLeft: 'auto',
        background: colors.primary.get(),
        color: colors.white.get(),
        border: `1px solid ${colors.black.tint1}`,
        paddingLeft: '0.5rem',
    },
    LocationTag: {
        position: 'absolute',
        top: '0.25rem',
        right: '0.25rem',
        background: colors.green.get(),
        borderRadius: '0.25rem',
        padding: '0 0.25rem',
    },
    LocationTagDaycare: {
        background: colors.pink.get(),
    },
    PokemonViewContainer: {
        marginTop: '0.5rem',
    },
    InfoBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.8rem',
    },
    SpecialAttributeImg: {
        height: '0.5rem',
        imageRendering: 'pixelated',
    }
});

export function pokemonSearch(searchString: string) {
    const normalize = (pokemonProp: string) => pokemonProp.toLowerCase();
    const searchStringSplit = searchString.split(':');
    if (searchStringSplit.length) {
        const property = searchStringSplit[0];
        const value = searchStringSplit[1];
        return (pokemon: PartyPokemon) => (
            true
        );
    } else {
        return (pokemon: PartyPokemon) => (
            normalize(pokemon.nickname).includes(searchString) ||
            normalize(pokemon.species).includes(searchString)
        );
    }
}


export function PokemonStorage() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [boxSelections, setBoxSelections] = useState<PartyPokemon['id'][]>([]);
    const [multipleSelectMode, setMultipleSelectMode] = useState<boolean>(false);
    const storage = useSelector<State, State['team']>((state: State) => state.team);
    const [filteredStorage, setFilteredStorage] = useState<State['team']>(storage);
    const getLocationTag = () => null;

    const onClickStoragePokemon = (poke: PartyPokemon) => (e: React.MouseEvent<HTMLElement>) => {
        if (e.ctrlKey) {
            setBoxSelections([...boxSelections, poke.id]);
        }
        else {
            setBoxSelections([poke.id]);
        }
    };

    const onSearch = (e?: React.ChangeEvent<HTMLElement>) => {
        const searchString = (e?.target as any).value.trim().toLowerCase();
        setSearchTerm(searchString);
        setFilteredStorage(filteredStorage.filter(pokemonSearch(searchString)));
        console.log(filteredStorage.filter(pokemonSearch(searchString)));
    };

    const releasePokemon = (e?: React.MouseEvent<HTMLElement>) => {
        return;
    };

    const sortPokemon = (e?: React.MouseEvent<HTMLElement>) => {
        return;
    };

    return <Dialog kind={DialogKind.Storage} title='Storage' className={styles.Dialog}>
        <div className={styles.StorageBar}>
            <Button disabled={!!filteredStorage.length} onClick={releasePokemon} value="Release" />
            <Button onClick={sortPokemon} value="Sort" />
            <input onChange={onSearch} value={searchTerm} className={styles.SearchBar} type='search' placeholder='Search...' />
        </div>
        <div className={styles.StorageContainer}>
            {filteredStorage.map(poke => <div key={poke.id} onClick={onClickStoragePokemon(poke)} className={classes(styles.StoragePokemon, boxSelections.includes(poke.id) && styles.StoragePokemonSelected)}>
                {getLocationTag() && <div className={classes(styles.LocationTag, styles.LocationTagDaycare)}>{getLocationTag}</div>}
                <StyledSprite member={poke} />
                <div className={styles.InfoBar}>
                    {poke?.isEgg ? <div>Egg</div> : <div>{poke?.nickname} lv.{poke?.level}</div>}
                    {(poke?.shiny || poke?.superShiny) && <img className={styles.SpecialAttributeImg} src='./images/ui/shiny-star.png' />}
                    {poke?.favorite && <img className={styles.SpecialAttributeImg} src='./images/ui/favorite-heart.png' />}
                </div>
            </div>)}
            
        </div>
        {
            filteredStorage.filter(poke => boxSelections.includes(poke.id))
                .map(poke => <div key={poke.id} className={styles.PokemonViewContainer}>
                    <PokemonView pokemon={poke} id={1} idx={1} hp={100} />
                </div>)
        }
    </Dialog>;
}