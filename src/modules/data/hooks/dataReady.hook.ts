import anylogger from 'anylogger';

/*
//more simpler then auth hook, just read data
export function useDataReadyHook(): [{ready: boolean, username: string}] {

  const [state, setState] = useState<{ready:boolean, username:string}>({ready:false, username: GUEST});

  useEffect(() => {
    const subscriptions: Subscription[] = [
      authService.username$.subscribe(async username => {
        log.info('POUCH USERNAME CHANGE: ', username);
        const merge = state.username === GUEST
        setState({ready:false, username: username});
        await dataService.init( username, 
                          authService.getUser().token, 
                          authService.getIsAuthenticated(), 
                          merge);
        setState({ready:true, username: username});
      }),

    ];
    
    // usersService.loadAll();
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[]);



  return [state];
}
*/
export {};